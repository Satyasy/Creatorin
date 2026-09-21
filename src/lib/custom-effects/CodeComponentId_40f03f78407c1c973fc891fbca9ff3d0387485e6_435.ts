// @ts-nocheck

function defineProperties(
  _component: unknown,
  _properties: unknown,
): void {}

export default function Effect() { }
export function setup(device, frame) {
    var wgsl = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  frameData: vec4f,
  inputDimsAndPad: vec4f,
  waterColor: vec4f,
  highlightColor: vec4f,
  intensity: vec4f,
  playhead: vec4f,
  scale: vec4f,
  center: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VsIn {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}

@fragment fn fs_main(@location(0) outputUv_in: vec2f) -> @location(0) vec4f {
  let outputUv = outputUv_in;
  let dims = max(u.frameData.yz, vec2f(1.0));
  let inputDims = max(u.inputDimsAndPad.xy, vec2f(1.0));
  let fragPx = outputUv * dims;
  let uvRaw = fragPx / inputDims;
  let waterColor = u.waterColor;
  let highlightColor = u.highlightColor;
  let intensity = u.intensity.x;
  let playhead = u.playhead.x;
  let scale = u.scale.x;
  let cx = u.center.x / 100.0;
  let cy = u.center.y / 100.0;
  let uv = (uvRaw - vec2f(cx, cy)) / scale + vec2f(1.0 - cx, 1.0 - cy);
  let TAU = 6.28318530718;
  let MAX_ITER = 5;
  let t_val = playhead * TAU / 100.0 + 23.0;
  let minDim = min(dims.x, dims.y);
  let uvPx = uv * dims / minDim;
  let p = (fract(uvPx) * TAU) - 250.0;
  var i = p;
  var c = 1.0;
  let inten = mix(0.002519, 0.01178, intensity);
  for (var n = 0; n < MAX_ITER; n++) {
    let nt = t_val * f32(n + 1);
    i = p + vec2f(cos(nt - i.x) + sin(nt + i.y), sin(nt - i.y) + cos(nt + i.x));
    c += 1.0 / length(vec2f(p.x / (sin(i.x + nt) / inten), p.y / (cos(i.y + nt) / inten)));
  }
  c /= f32(MAX_ITER);
  c = 1.17 - pow(c, 1.4);
  let causticMask = clamp(pow(abs(c), 8.0), 0.0, 1.0);
  let alpha = mix(waterColor.a, highlightColor.a, causticMask);
  let colour = mix(waterColor.rgb, highlightColor.rgb, causticMask);
  return vec4f(colour * alpha, alpha);
}
`;
    frame.state.module = device.createShaderModule({ code: wgsl });
    frame.state.pipeline = null;
    frame.state.pipelineFormat = null;
    frame.state.quad = device.createBuffer({
        size: 6 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(frame.state.quad.getMappedRange()).set([
        -1, -1, 0, 1,
        1, -1, 1, 1,
        -1, 1, 0, 0,
        -1, 1, 0, 0,
        1, -1, 1, 1,
        1, 1, 1, 0,
    ]);
    frame.state.quad.unmap();
    frame.state.uniformBuf = device.createBuffer({
        size: 128,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
}
export function render(device, frame) {
    var params = frame.params || {};
    function finiteNumber(value, fallback) {
        var num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }
    function numberParam(name, fallback) {
        return finiteNumber(params[name], fallback);
    }
    function colorParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.r, fallback[0]),
            finiteNumber(value.g, fallback[1]),
            finiteNumber(value.b, fallback[2]),
            finiteNumber(value.a, fallback[3]),
        ];
    }
    function pointParam(name, fallback) {
        var value = params[name] || {};
        return [finiteNumber(value.x, fallback[0]), finiteNumber(value.y, fallback[1])];
    }
    var output = frame.output || {};
    var width = Math.max(1, finiteNumber(output.width, 1));
    var height = Math.max(1, finiteNumber(output.height, 1));
    var time = 0;
    var outputPad = 0;
    var inputPad = 0;
    var inputWidth = Math.max(1, width - 2 * outputPad);
    var inputHeight = Math.max(1, height - 2 * outputPad);
    device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
        time, width, height, outputPad,
        inputWidth, inputHeight, inputPad, 0,
        ...colorParam("waterColor", [0, 0.388, 0.706, 1]),
        ...colorParam("highlightColor", [0.804, 0.961, 1.0, 1]),
        numberParam("intensity", 0.5), 0, 0, 0,
        numberParam("playhead", 0), 0, 0, 0,
        numberParam("scale", 1), 0, 0, 0,
        ...pointParam("center", [50, 50]), 0, 0,
    ]));
    var outputFormat = frame.output.format;
    if (frame.state.pipeline == null || frame.state.pipelineFormat !== outputFormat) {
        frame.state.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: frame.state.module,
                entryPoint: 'vs_main',
                buffers: [{ arrayStride: 16, attributes: [
                    { shaderLocation: 0, format: 'float32x2', offset: 0 },
                    { shaderLocation: 1, format: 'float32x2', offset: 8 },
                ] }],
            },
            fragment: { module: frame.state.module, entryPoint: 'fs_main', targets: [{ format: outputFormat }] },
            primitive: { topology: 'triangle-list' },
        });
        frame.state.pipelineFormat = outputFormat;
    }
    var bindGroup = device.createBindGroup({
        layout: frame.state.pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: frame.state.uniformBuf } }],
    });
    var encoder = device.createCommandEncoder();
    var pass = encoder.beginRenderPass({ colorAttachments: [{
        view: frame.output.createView(),
        loadOp: 'clear',
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        storeOp: 'store',
    }] });
    pass.setPipeline(frame.state.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, frame.state.quad);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {});

export const manifest = {
  "name": "Water caustic",
  "version": 2,
  "isAnimated": false,
  "usesMouse": false
}
