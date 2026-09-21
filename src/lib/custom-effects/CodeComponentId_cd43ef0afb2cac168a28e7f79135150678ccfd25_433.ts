// @ts-nocheck

function defineProperties(_component: unknown, _properties: unknown): void {}

export default function Effect() {}

export function setup(device, frame) {
  const wgsl = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  frameData: vec4f,
  waveColor: vec4f,
  wavelength: f32,
  zoom: f32,
  amplitude: f32,
  glowIntensity: f32,
  thickness: f32,
  offset: f32,
  _pad0: f32,
  _pad1: f32,
  centerX: f32,
  centerY: f32,
  angleDeg: f32,
  _pad2: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
struct VsIn { @location(0) pos: vec2f, @location(1) uv: vec2f };
struct VsOut { @builtin(position) position: vec4f, @location(0) uv: vec2f };
@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}
@fragment fn fs_main(@location(0) uv_in: vec2f, @builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let frameW = u.frameData.y;
  let frameH = u.frameData.z;
  let PI = 3.14159265;
  let cx = u.centerX * frameW / 100.0;
  let cy = u.centerY * frameH / 100.0;
  let aspect = frameW / frameH;
  let dxN = (fragCoord.x - cx) / u.zoom;
  let dyN = (fragCoord.y - cy) / u.zoom * aspect;
  let a = u.angleDeg * PI / 180.0;
  let rx = dxN * cos(a) + dyN * sin(a);
  let ry = -dxN * sin(a) + dyN * cos(a);
  let waveY = u.amplitude * sin(2.0 * PI / u.wavelength * rx + u.offset / 100.0 * 2.0 * PI);
  let d = abs(ry - waveY) / aspect;
  let core = 1.0 - smoothstep(0.0, u.thickness * 2.0, d);
  let glowSpreadPx = 40.0 + u.glowIntensity * 60.0;
  let glow = pow(1.0 - pow(clamp(d / glowSpreadPx, 0.0, 1.0), 0.4), 1.0);
  let brightness = clamp(core + glow * u.glowIntensity, 0.0, 1.0);
  let waveA = u.waveColor.a * brightness;
  let bgA = 1.0 - waveA;
  let outA = waveA + bgA;
  let outRGB = select(vec3f(0.0), (u.waveColor.rgb * waveA) / outA, outA > 0.0001);
  return vec4f(outRGB * outA, outA);
}`;
  frame.state.module = device.createShaderModule({ code: wgsl });
  frame.state.pipeline = null;
  frame.state.pipelineFormat = null;
  frame.state.quad = device.createBuffer({ size: 96, usage: GPUBufferUsage.VERTEX, mappedAtCreation: true });
  new Float32Array(frame.state.quad.getMappedRange()).set([
    -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0,
    -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0,
  ]);
  frame.state.quad.unmap();
  frame.state.uniformBuf = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
}

export function render(device, frame) {
  const params = frame.params || {};
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const width = Math.max(1, finite(frame.output?.width, 1));
  const height = Math.max(1, finite(frame.output?.height, 1));
  const color = params.waveColor || { r: 0, g: 1, b: 0.6, a: 1 };
  const transform = params.transform || { x: 50, y: 50, radius: 30, angle: 0 };
  device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
    finite(frame.time, 0), width, height, 0,
    finite(color.r, 0), finite(color.g, 1), finite(color.b, 0.6), finite(color.a, 1),
    finite(transform.radius, 30) * width / 100, finite(params.zoom, 1), finite(params.amplitude, 15) / 100 * width, finite(params.glowIntensity, 1),
    1, finite(params.offset, 0), 0, 0,
    finite(transform.x, 50), finite(transform.y, 50), finite(transform.angle, 0), 0,
  ]));
  const format = frame.output.format;
  if (!frame.state.pipeline || frame.state.pipelineFormat !== format) {
    frame.state.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: frame.state.module, entryPoint: "vs_main", buffers: [{ arrayStride: 16, attributes: [{ shaderLocation: 0, format: "float32x2", offset: 0 }, { shaderLocation: 1, format: "float32x2", offset: 8 }] }] },
      fragment: { module: frame.state.module, entryPoint: "fs_main", targets: [{ format }] },
      primitive: { topology: "triangle-list" },
    });
    frame.state.pipelineFormat = format;
  }
  const bindGroup = device.createBindGroup({ layout: frame.state.pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: frame.state.uniformBuf } }] });
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({ colorAttachments: [{ view: frame.output.createView(), loadOp: "clear", clearValue: { r: 0, g: 0, b: 0, a: 1 }, storeOp: "store" }] });
  pass.setPipeline(frame.state.pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.setVertexBuffer(0, frame.state.quad);
  pass.draw(6);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

defineProperties(Effect, {});
export const manifest = { name: "Glowing wave", version: 2, isAnimated: true, usesMouse: false };
