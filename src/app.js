import Stats from 'stats.js'
import * as dat from 'dat.gui'

import * as THREE from 'three'
import { ColorGUIHelper } from "./colorHelper.js"

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';


export class App {

    constructor(canvas) {

        this.stats = [];
        this.canvas = canvas;
        this.gui = new dat.GUI()
        this.init();
    }

    init() {

        this.setupStats();
        this.setupBasics();
        //this.setupDracoLoader();
        this.setupLights();
        this.setupLoadModels();
        this.setupCamera();
        this.setupRenderer();

        this.update();
    }

    onResize() {

        this.width = window.innerWidth
        this.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    /*
    onKeyDown(event) {

        switch (event.keyCode) {
            case 87: // W
                control.setMode('translate');
                break;

            case 69: // E
                control.setMode('rotate');
                break;

            case 82: // R
                control.setMode('scale');
                break;
        }
    }
    */

    setupDracoLoader() {
        this.dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
    }

    setupStats() {

        try {
            for (let i = 0; i < 3; i++) {
                let stat = new Stats()
                stat.showPanel(i)
                document.body.appendChild(stat.dom)
                stat.domElement.style.cssText = 'position:absolute;top:0px;left:' + (i * 80) + 'px;';

                this.stats.push(stat)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    statBegin() {
        if (this.stats)
            this.stats.forEach(element => {
                element.begin()
            });
    }

    statEnd() {
        if (this.stats)
            this.stats.forEach(element => {
                element.end()
            });
    }

    setupBasics() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.scene = new THREE.Scene();
        this.textureLoader = new THREE.TextureLoader();


        this.lights = {};
        this.meshes = {};

        this.clock = new THREE.Clock()
        this.previousTime = 0

        //Helpers
        const axisHelper = new THREE.AxesHelper(5);
        this.scene.add(axisHelper);

        //GUI
        this.guiGeneralFolder = this.gui.addFolder("General");
        this.guiGeneralFolder.add(axisHelper, 'visible').setValue(false).name('Scene axis');
        this.guiGeneralFolder.open();

        //Events
        window.addEventListener('resize', this.onResize)
        window.addEventListener('keydown', this.onKeyDown)
    }

    setupLights() {

        //Various Lights
        this.lights.ambient = new THREE.AmbientLight();
        this.lights.ambient.color = new THREE.Color(0xffffff);
        this.lights.ambient.intensity = 0.3;
        this.scene.add(this.lights.ambient);

        this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.3);
        this.lights.directional.position.set(1, 4, 0);
        this.scene.add(this.lights.directional);

        //Helpers
        const dirlightHelper = new THREE.DirectionalLightHelper(this.lights.directional);
        this.scene.add(dirlightHelper);

        //GUI
        const ambientFolder = this.gui.addFolder("Ambient light");
        ambientFolder.add(this.lights.ambient, 'visible').name('enable')
        ambientFolder.add(this.lights.ambient, 'intensity').min(0).max(1).step(0.001);
        ambientFolder.addColor(new ColorGUIHelper(this.lights.ambient, 'color'), 'value').name('color');
        ambientFolder.open();

        const dirlightFolder = this.gui.addFolder("Directional light");
        dirlightFolder.add(this.lights.directional, 'visible').name('enable')
        dirlightFolder.add(this.lights.directional, 'intensity').min(0).max(1).step(0.001);
        dirlightFolder.addColor(new ColorGUIHelper(this.lights.directional, 'color'), 'value').name('color');
        dirlightFolder.add(dirlightHelper, 'visible').name('show helper')
        dirlightFolder.open();
    }

    setupLoadModels() {

        this.gltfLoader = new GLTFLoader()

        if (this.dracoLoader)
            this.gltfLoader.setDRACOLoader(this.dracoLoader)

        //Load from files
        if (this.gltfLoader)
            this.gltfLoader.load(
                'models/[filename].glb',
                (gltf) => {
                    this.scene.add(gltf.scene)
                }
            )

        //Create Plane
        const planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.meshes.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.meshes.plane.rotateX(-90 * Math.PI / 180);
        this.scene.add(this.meshes.plane);

        //Plane GUI
        const planeFolder = this.gui.addFolder("Plane");
        planeFolder.add(this.meshes.plane, 'visible').name('enable')
        planeFolder.addColor(new ColorGUIHelper(planeMaterial, 'color'), 'value').name('color');
        planeFolder.open();

        //Create Cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.meshes.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.meshes.cube.position.set(0, 2, 0);
        this.scene.add(this.meshes.cube);

        //Cube GUI
        const cubeFolder = this.gui.addFolder("Cube");
        cubeFolder.add(this.meshes.cube, 'visible').name('enable')
        cubeFolder.addColor(new ColorGUIHelper(cubeMaterial, 'color'), 'value').name('color');
        cubeFolder.open();
    }

    setupCamera() {

        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
        this.camera.position.set(- 8, 4, 8);
        this.scene.add(this.camera);

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 1, 0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        //Helper
        const cameraHelper = new THREE.CameraHelper(this.camera);
        this.scene.add(cameraHelper);

        //GUI
        const cameraFolder = this.gui.addFolder("Camera");
        cameraFolder.add(this.camera, 'fov').onChange(() => { this.camera.updateProjectionMatrix(); });
        cameraFolder.add(this.camera, 'near').onChange(() => { this.camera.updateProjectionMatrix(); });
        cameraFolder.add(this.camera, 'far').onChange(() => { this.camera.updateProjectionMatrix(); });
        cameraFolder.add(cameraHelper, 'visible').setValue(false).name('Show helper');
        cameraFolder.open();

    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor(0x888888, 1.0);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        //GUI

        console.log(this.renderer.info)
    }

    update() {

        this.statBegin();
        const elapsedTime = this.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime

        // Update controls
        this.controls.update()

        // Render
        this.renderer.render(this.scene, this.camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(() => { this.update() })

        this.statEnd();
    }
}
