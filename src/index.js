(async () => {
  const canvas = document.createElement('canvas')
  const size = { width: 640, height: 360 }
  canvas.width = size.width
  canvas.height = size.height
  document.body.appendChild(canvas)

  const context = canvas.getContext("gpupresent")
  const adapter = await navigator.gpu.requestAdapter()
  const device = await adapter.requestDevice()
  const queue = device.defaultQueue
  const swapChain = context.configureSwapChain({
    device,
    format: "bgra8unorm",
    usage: GPUTextureUsage.OUTPUT_ATTACHMENT
  })


  // glslangModule
  const module = await (window["eval"])(`import("https://unpkg.com/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js")`)
  glslangModule = await module.default()

  const renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
    vertexState: { vertexBuffers: [] },
    vertexStage: {
      module: device.createShaderModule({
        code: glslangModule.compileGLSL(require('./shader/main.vert').default, 'vertex'),
      }),
      entryPoint: "main"
    },
    fragmentStage: {
      module: device.createShaderModule({
        code: glslangModule.compileGLSL(require('./shader/main.frag').default, 'fragment'),
      }),
      entryPoint: "main"
    },
    primitiveTopology: "triangle-list",
    depthStencilState: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth32float"
    },
    rasterizationState: { cullMode: "none" },
    colorStates: [{ format: "bgra8unorm" }],
  })

  const state = {
    context,
    device,
    queue,
    swapChain,
    renderPipeline,
  }
  window.state = state // debug

  const depthAttachment = device.createTexture({
    size: { width: size.width, height: size.height, depth: 1 },
    format: "depth32float",
    usage: GPUTextureUsage.OUTPUT_ATTACHMENT
  }).createView();

  const af = () => {
    const commandEncoder = device.createCommandEncoder({})
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        attachment: swapChain.getCurrentTexture().createView(),
        loadValue: {r: 0, g: 0, b: 0, a: 0},
        storeOp: "store"
      }],
      depthStencilAttachment: {
        attachment: depthAttachment,
        depthLoadValue: 1.0,
        depthStoreOp: "store",
        stencilLoadValue: 0,
        stencilStoreOp: "store"
      }
    })
    renderPass.setPipeline(state.renderPipeline)
    renderPass.draw(3)
    renderPass.endPass()
    device.defaultQueue.submit([commandEncoder.finish()])
    requestAnimationFrame(af)
  }
  requestAnimationFrame(af)
})()
