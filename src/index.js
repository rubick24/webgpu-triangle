const shaderSource = `
// Vertex shader

struct VertexOutput {
    [[builtin(position)]] clip_position: vec4<f32>;
};

[[stage(vertex)]]
fn mainVert(
    [[builtin(vertex_index)]] in_vertex_index: u32,
) -> VertexOutput {
    var out: VertexOutput;
    let x = f32(1 - i32(in_vertex_index)) * 0.5;
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1) * 0.5;
    out.clip_position = vec4<f32>(x, y, 0.0, 1.0);
    return out;
}

// Fragment shader

[[stage(fragment)]]
fn mainFrag(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return vec4<f32>(0., 0.5, 0.8, 1.0);
}
`

;(async () => {
  const canvas = document.createElement('canvas')
  const size = { width: 640, height: 360 }
  canvas.width = size.width
  canvas.height = size.height
  document.body.appendChild(canvas)

  const context = canvas.getContext('webgpu')
  const adapter = await navigator.gpu.requestAdapter()
  const device = await adapter.requestDevice()
  const preferredFormat = context.getPreferredFormat?.(adapter) || 'bgra8unorm'
  const presentationSize = { width: canvas.width, height: canvas.height }
  context.configure({
    device,
    format: preferredFormat,
    size: presentationSize
  })

  const shader = device.createShaderModule({
    label: 'Shader',
    code: shaderSource
  })

  const renderPipelineLayout = device.createPipelineLayout({
    label: 'Render Pipeline Layout',
    bindGroupLayouts: []
  })

  const renderPipeline = device.createRenderPipeline({
    label: 'Render Pipeline',
    layout: renderPipelineLayout,
    vertex: {
      module: shader,
      entryPoint: 'mainVert',
      buffers: []
    },
    fragment: {
      module: shader,
      entryPoint: 'mainFrag',
      targets: [
        {
          format: preferredFormat
        }
      ]
    },
    primitive: {
      topology: 'triangle-list'
    }
  })

  const af = () => {
    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    const renderPass = commandEncoder.beginRenderPass({
      label: 'Render Pass',
      colorAttachments: [
        {
          view: textureView,
          loadValue: { r: 0, g: 0, b: 0, a: 0 },
          storeOp: 'store'
        }
      ]
    })
    renderPass.setPipeline(renderPipeline)
    renderPass.draw(3)
    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(af)
  }
  requestAnimationFrame(af)
})()
