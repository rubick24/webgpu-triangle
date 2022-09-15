if (!navigator.gpu) throw Error('WebGPU not supported.')

const adapter = await navigator.gpu.requestAdapter()
if (!adapter) throw Error('Couldn’t request WebGPU adapter.')

const device = await adapter.requestDevice()
if (!device) throw Error('Couldn’t request WebGPU logical device.')

console.log(device.limits)

const module = device.createShaderModule({
  code: `
    @group(0) @binding(1)
    var<storage, read_write> output: array<f32>;

    @compute @workgroup_size(64)
    fn main(

      @builtin(global_invocation_id)
      global_id : vec3<u32>,

      @builtin(local_invocation_id)
      local_id : vec3<u32>,

    ) {
      output[global_id.x] = f32(local_id.x);
    }
  `
})

const BUFFER_SIZE = 1024

const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: 'storage'
      }
    }
  ]
})
const output = device.createBuffer({
  size: BUFFER_SIZE,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
})

const stagingBuffer = device.createBuffer({
  size: BUFFER_SIZE,
  usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
})
const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    {
      binding: 1,
      resource: {
        buffer: output
      }
    }
  ]
})
const pipelineLayout = device.createPipelineLayout({
  bindGroupLayouts: [bindGroupLayout]
})

const pipeline = device.createComputePipeline({
  layout: pipelineLayout,
  compute: {
    module,
    entryPoint: 'main'
  }
})

const commandEncoder = device.createCommandEncoder()
const passEncoder = commandEncoder.beginComputePass()
passEncoder.setPipeline(pipeline)
passEncoder.setBindGroup(0, bindGroup)
passEncoder.dispatchWorkgroups(Math.ceil(BUFFER_SIZE / 64))
passEncoder.end()
commandEncoder.copyBufferToBuffer(
  output,
  0, // Source offset
  stagingBuffer,
  0, // Destination offset
  BUFFER_SIZE
)
const commands = commandEncoder.finish()
device.queue.submit([commands])

await stagingBuffer.mapAsync(
  GPUMapMode.READ,
  0, // Offset
  BUFFER_SIZE // Length
)
const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE)
const data = copyArrayBuffer.slice(0)
stagingBuffer.unmap()
console.log(new Float32Array(data))

export {}
