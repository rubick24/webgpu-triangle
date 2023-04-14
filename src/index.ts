import triangleVertWGSL from './shader/triangle.vert.wgsl'
import redFragWGSL from './shader/red.frag.wgsl'
const adapter = (await navigator.gpu.requestAdapter())!
const device = (await adapter.requestDevice())!

const canvas = document.createElement('canvas')
const devicePixelRatio = window.devicePixelRatio || 1;

const width = 960
const height = 540
canvas.width = width * devicePixelRatio
canvas.height = height * devicePixelRatio
Object.assign(canvas.style, {
  width: `${width}px`,
  height: `${height}px`
})
document.body.appendChild(canvas)
const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext
const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
console.log(1)
context.configure({
  device,
  format: presentationFormat,
  alphaMode: 'premultiplied'
})
const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: device.createShaderModule({
      code: triangleVertWGSL
    }),
    entryPoint: 'main'
  },
  fragment: {
    module: device.createShaderModule({
      code: redFragWGSL
    }),
    entryPoint: 'main',
    targets: [
      {
        format: presentationFormat
      }
    ]
  },
  primitive: {
    topology: 'triangle-list'
  },
})

function frame() {
  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }
    ]
  }

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
  passEncoder.setPipeline(pipeline)
  passEncoder.draw(3, 1, 0, 0)
  passEncoder.end()

  device.queue.submit([commandEncoder.finish()])
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)

export {}
