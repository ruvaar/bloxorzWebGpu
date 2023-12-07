import { vec3, mat3, mat4 } from './lib/gl-matrix-module.js';

import * as WebGPU from './common/engine/WebGPU.js';

import { Camera } from './common/engine/core.js';

import {
    getLocalModelMatrix,
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
} from './common/engine/core/SceneUtils.js';

import { BaseRenderer } from './common/engine/renderers/BaseRenderer.js';

import { Light } from './Light.js';

const vertexBufferLayout = {
    arrayStride: 32,
    attributes: [
        {
            name: 'position',
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3',
        },
        {
            name: 'texcoords',
            shaderLocation: 1,
            offset: 12,
            format: 'float32x2',
        },
        {
            name: 'normal',
            shaderLocation: 2,
            offset: 20,
            format: 'float32x3',
        }, 
    ],
};

export class Renderer extends BaseRenderer {

    constructor(canvas) {
        super(canvas);
    }

    async initialize() {
        await super.initialize();

        const code = await fetch(new URL('./shader.wgsl', import.meta.url))
            .then(response => response.text());
        const module = this.device.createShaderModule({ code });

        this.pipeline = await this.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'vertex',
                buffers: [ vertexBufferLayout ],
            },
            fragment: {
                module,
                entryPoint: 'fragment',
                targets: [{ format: this.format }],
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });

        this.recreateDepthTexture();
    }

    setEnvironment(images) {
        this.environmentTexture?.destroy();
        this.environmentTexture = this.device.createTexture({
            size: [images[0].width, images[0].height, 6],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        for (let i = 0; i < images.length; i++) {
            this.device.queue.copyExternalImageToTexture(
                { source: images[i] },
                { texture: this.environmentTexture, origin: [0, 0, i] },
                [images[i].width, images[i].height],
            );
        }

        this.environmentSampler = this.device.createSampler({
            minFilter: 'linear',
            magFilter: 'linear',
        });

        return [this.environmentTexture, this.environmentSampler]
    }


    recreateDepthTexture() {
        this.depthTexture?.destroy();
        this.depthTexture = this.device.createTexture({
            format: 'depth24plus',
            size: [this.canvas.width, this.canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    prepareNode(node) {
        if (this.gpuObjects.has(node)) {
            return this.gpuObjects.get(node);
        }

        const modelUniformBuffer = this.device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const modelBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: { buffer: modelUniformBuffer } },
            ],
        });

        const gpuObjects = { modelUniformBuffer, modelBindGroup };
        this.gpuObjects.set(node, gpuObjects);
        return gpuObjects;
    }

    prepareCamera(camera) {
        if (this.gpuObjects.has(camera)) {
            return this.gpuObjects.get(camera);
        }

        const cameraUniformBuffer = this.device.createBuffer({
            size: 144,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const cameraBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: cameraUniformBuffer } },
            ],
        });

        const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
        this.gpuObjects.set(camera, gpuObjects);
        return gpuObjects;
    }
    prepareLight(light) {
        if (this.gpuObjects.has(light)) {
            return this.gpuObjects.get(light);
        }

        const lightUniformBuffer = this.device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const lightBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(3),
            entries: [
                { binding: 0, resource: { buffer: lightUniformBuffer } },
            ],
        });
    
        const gpuObjects = { lightUniformBuffer, lightBindGroup };
        this.gpuObjects.set(light, gpuObjects);
        return gpuObjects;
    }

    prepareMaterial(material) {
        if (this.gpuObjects.has(material)) {
            return this.gpuObjects.get(material);
        }

        const baseTexture = this.prepareImage(material.baseTexture.image).gpuTexture;
        const baseSampler = this.prepareSampler(material.baseTexture.sampler).gpuSampler;
        //let uEnvironmentTexture = {};
        //let uEnvironmentSampler = {};
        //if (material?.environmentTexture) {
        //    
        //    const pixelData = new Uint8Array([255, 255, 255, 255]); // RGBA values for a white pixel
        //    const imageDataSettings = { width: 1, height: 1 };
        //    
        //    let whiteImageBitmap;
        //    createImageBitmap({ data: pixelData, ...imageDataSettings }).then(
        //        result => {
        //            whiteImageBitmap = result;
        //        }
        //    );
        //    console.log(whiteImageBitmap instanceof ImageBitmap)
//
        //    uEnvironmentTexture = this.device.createTexture({
        //        size: [1, 1, 6],
        //        format: 'rgba8unorm',
        //        usage:
        //        GPUTextureUsage.TEXTURE_BINDING |
        //        GPUTextureUsage.COPY_DST |
        //        GPUTextureUsage.RENDER_ATTACHMENT,
        //    });
        //    
        //    for (let i = 0; i < 6; i++) {
        //        this.device.queue.copyExternalImageToTexture(
        //            { source:  whiteImageBitmap },
        //            { texture: uEnvironmentTexture, origin: [0, 0, i] },
        //            [1, 1],
        //        );
        //    }
        //    
        //    uEnvironmentSampler = this.device.createSampler({
        //        minFilter: 'linear',
        //        magFilter: 'linear',
        //    });
        //}
//
        //else {
        //    [uEnvironmentTexture, uEnvironmentSampler] = this.setEnvironment(material.environmentTexture);
        //}

        const materialUniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const materialBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                { binding: 0, resource: { buffer: materialUniformBuffer } },
                { binding: 1, resource: baseTexture.createView() },
                { binding: 2, resource: baseSampler },
        //        { binding: 3, resource: uEnvironmentTexture },
        //        { binding: 4, resource: uEnvironmentSampler },
            ],
        });

        const gpuObjects = { materialUniformBuffer, materialBindGroup };
        this.gpuObjects.set(material, gpuObjects);
        return gpuObjects;
    }

    render(scene, camera) {
        if (this.depthTexture.width !== this.canvas.width || this.depthTexture.height !== this.canvas.height) {
            this.recreateDepthTexture();
        }

        const encoder = this.device.createCommandEncoder();
        this.renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: [1, 1, 1, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'discard',
            },
        });
        this.renderPass.setPipeline(this.pipeline);

        const cameraComponent = camera.getComponentOfType(Camera);
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        const cameraMatrix = getGlobalModelMatrix(camera);
        const cameraPosition = mat4.getTranslation(vec3.create(), cameraMatrix);
        const { cameraUniformBuffer, cameraBindGroup } = this.prepareCamera(cameraComponent);

        this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
        this.device.queue.writeBuffer(cameraUniformBuffer, 64, projectionMatrix);
        this.device.queue.writeBuffer(cameraUniformBuffer, 128, cameraPosition);
        this.renderPass.setBindGroup(0, cameraBindGroup);

        const light = scene.find (node => node.getComponentOfType(Light));
        const lightComponent = light.getComponentOfType(Light);
        const lightMatrix = getGlobalModelMatrix(light);
        const lightPosition = mat4.getTranslation(vec3.create(), lightMatrix);
        const {lightUniformBuffer, lightBindGroup} = this.prepareLight(lightComponent);
    

        this.device.queue.writeBuffer(lightUniformBuffer, 0, new Float32Array(lightPosition));
        this.device.queue.writeBuffer(lightUniformBuffer, 12, new Float32Array([lightComponent.ambient]));
        this.device.queue.writeBuffer(lightUniformBuffer, 16, new Float32Array([lightComponent.shininess]));
        this.renderPass.setBindGroup(3, lightBindGroup);

        this.renderNode(scene);

        this.renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }


    renderNode(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        const normalMatrix = this.mat3tomat4(mat3.normalFromMat4(mat3.create(), modelMatrix));
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
        this.renderPass.setBindGroup(1, modelBindGroup);

        for (const model of getModels(node)) {
            this.renderModel(model);
        }

        for (const child of node.children) {
            this.renderNode(child, modelMatrix);
        }
    }

    renderModel(model) {
        for (const primitive of model.primitives) {
            this.renderPrimitive(primitive);
        }
    }

    renderPrimitive(primitive) {
        const { materialUniformBuffer, materialBindGroup } = this.prepareMaterial(primitive.material);
        this.device.queue.writeBuffer(materialUniformBuffer, 0, new Float32Array(primitive.material.baseFactor));
        this.renderPass.setBindGroup(2, materialBindGroup);

        const { vertexBuffer, indexBuffer } = this.prepareMesh(primitive.mesh, vertexBufferLayout);
        this.renderPass.setVertexBuffer(0, vertexBuffer);
        this.renderPass.setIndexBuffer(indexBuffer, 'uint32');

        this.renderPass.drawIndexed(primitive.mesh.indices.length);
    }

}
