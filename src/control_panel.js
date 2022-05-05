import { Neu3D } from './neu3d';
import dat from '../etc/dat.gui';
import { datGuiPresets } from './presets.js';

/**
 * Create a button in control Panel with tooltip and icon.
 * @param {*} controlPanel
 * @param {*} name
 * @param {*} icon
 * @param {*} iconAttrs
 * @param {*} tooltip
 * @param {*} func
 * @returns
 */
function _createBtn(controlPanel, name, icon, iconAttrs, tooltip, func) {
  let newButton = function () {
    this[name] = func;
  };
  let btn = new newButton();
  let buttonid = controlPanel.add(btn, name).title(tooltip).icon(icon, "strip", iconAttrs);
  return buttonid;
}

/**
* Initialize Control Panel dat.GUI
* @param {object} options
*/
Neu3D.prototype.initControlPanel = function(options = {}) {
  let GUIOptions = {
    autoPlace: (options.autoPlace !== undefined) ? options.autoPlace : false,
    resizable: (options.resizable !== undefined) ? options.resizable : true,
    scrollable: (options.scrollable !== undefined) ? options.scrollable : true,
    closeOnTop: (options.closeOnTop !== undefined) ? options.closeOnTop : true,
    createButtons: (options.createButtons !== undefined) ? options.createButtons : true,
    preset: (options.preset !== undefined) ? options.preset : "Low",
    load: datGuiPresets
  };
  for (let key in options) {
    if (!(key in GUIOptions)) {
      GUIOptions[key] = options[key];
    }
  }

  let controlPanel = new dat.GUI(GUIOptions);
  controlPanel.remember(this.settings);
  // controlPanel.remember(this.settings.toneMappingPass);
  controlPanel.remember(this.settings.bloomPass);
  controlPanel.remember(this.settings.effectFXAA);
  controlPanel.remember(this.settings.backrenderSSAO);
  controlPanel.__closeButton.style.visibility = 'hidden';
  this._controlPanelBtnIds = []
  let neuronNum = controlPanel.add(this.uiVars, 'frontNum').name('# Neurons: ');
  neuronNum.domElement.style["pointerEvents"] = "None";
  neuronNum.domElement.parentNode.parentNode.classList.add('noneurons');
  if (GUIOptions['createButtons']) {
    let btnId = ''
    btnId = _createBtn(controlPanel, "uploadFile", "fa fa-upload", {}, "Upload SWC File", () => { this.fileUploadInput.click(); });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "resetView", "fa fa-sync", { "aria-hidden": "true" }, "Reset View", () => { this.resetView() });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "resetVisibleView", "fa fa-align-justify", {}, "Center and zoom into visible Neurons/Synapses", () => { this.resetVisibleView() });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "hideAll", "fa fa-eye-slash", {}, "Hide All", () => { this.hideAll() });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "showAll", "fa fa-eye", {}, "Show All", () => { this.showAll() });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "takeScreenshot", "fa fa-camera", {}, "Download Screenshot", () => { this._take_screenshot = true; });
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "removeUnpin", "fa fa-trash", {}, "Remove Unpinned Neurons", () => { this.removeUnpinned(); })
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "removeUnpin", "fa fa-map-upin", {}, "Unpin All", () => { this.unpinAll(); })
    this._controlPanelBtnIds.push(btnId);
    btnId = _createBtn(controlPanel, "showSettings", "fa fa-cogs", {}, "Display Settings", () => { controlPanel.__closeButton.click(); })
    this._controlPanelBtnIds.push(btnId);
  }
  // add settings
  let f_vis = controlPanel.addFolder('Settings');
  let f0 = f_vis.addFolder('Display Mode');
  // f0.add(this.settings, 'neuron3d').name("Enable 3D Mode");
  f0.add(this.settings, 'neuron3dMode', [0, 1, 2, 3, 4, 5, 6]);
  f0.add(this.settings, 'neuron3dApp').name("Change existing?");

  let f1 = f_vis.addFolder('Visualization');
  f1.add(this.settings, 'meshWireframe').name("Show Wireframe");
  f1.addColor(this.settings, 'backgroundColor').name("Background");
  f1.addColor(this.settings, 'sceneBackgroundColor').name("Scene");
  let f1_1 = f1.addFolder('Opacity');

  f1_1.add(this.settings, 'defaultOpacity', 0.0, 1.0).name('Default');
  f1_1.add(this.settings, 'synapseOpacity', 0.0, 1.0).name('Synapse');
  f1_1.add(this.settings, 'backgroundOpacity', 0.0, 1.0).name("BG Opacity");
  f1_1.add(this.settings, 'backgroundWireframeOpacity', 0.0, 1.0).name("Wireframe Opacity");
  f1_1.add(this.settings, 'highlightedObjectOpacity', 0.0, 1.0).name('Highlighted');
  f1_1.add(this.settings, 'lowOpacity', 0.0, 1.0).name('Low in Highlight');
  f1_1.add(this.settings, 'nonHighlightableOpacity', 0.0, 1.0).name('NonHighlightable');
  f1_1.add(this.settings, 'pinOpacity', 0.0, 1.0).name('Pinned');
  f1_1.add(this.settings, 'pinLowOpacity', 0.0, 1.0).name('Low in Pinned');


  let f1_2 = f1.addFolder('Advanced');

  // f1_2.add(this.settings.toneMappingPass, 'brightness').name("ToneMap Brightness");
  f1_2.add(this.settings.bloomPass, 'enabled').name("Bloom");
  f1_2.add(this.settings.bloomPass, 'radius', 0.0, 10.0).name("BloomRadius");
  f1_2.add(this.settings.bloomPass, 'strength', 0.0, 1.0).name("BloomStrength");
  f1_2.add(this.settings.bloomPass, 'threshold', 0.0, 2.0).name("BloomThreshold");
  f1_2.add(this.settings.effectFXAA, 'enabled').name("FXAA");
  f1_2.add(this.settings.backrenderSSAO, 'enabled').name("SSAO");

  let f2 = f_vis.addFolder('Size');
  f2.add(this.settings, 'defaultRadius', this.settings.minRadius, this.settings.maxRadius);
  let ctl_minR = f2.add(this.settings, 'minRadius', 0);
  ctl_minR.onChange((value) => { value = Math.min(value, this.settings.maxRadius); });
  let ctl_maxR = f2.add(this.settings, 'maxRadius', 0);

  f2.add(this.settings, 'defaultSomaRadius', this.settings.minSomaRadius, this.settings.maxSomaRadius);
  ctl_maxR.onChange((value) => { value = Math.max(value, this.settings.minRadius); });
  let ctl_minSomaR = f2.add(this.settings, 'minSomaRadius', 0);
  ctl_minSomaR.onChange((value) => { value = Math.min(value, this.settings.maxSomaRadius); });
  let ctl_maxSomaR = f2.add(this.settings, 'maxSomaRadius', 0);
  ctl_maxSomaR.onChange((value) => { value = Math.max(value, this.settings.minSomaRadius); });

  f2.add(this.settings, 'defaultSynapseRadius', this.settings.minSynapseRadius, this.settings.maxSynapseRadius);
  let ctl_minSynR = f2.add(this.settings, 'minSynapseRadius', 0);
  ctl_minSynR.onChange((value) => { value = Math.min(value, this.settings.maxSynapseRadius); });
  let ctl_maxSynR = f2.add(this.settings, 'maxSynapseRadius', 0);
  ctl_maxSynR.onChange((value) => { value = Math.max(value, this.settings.minSynapseRadius); });

  this.settings.on("change", (() => {
    controlPanel.updateDisplay();
  }), [
    'neuron3dMode', 'meshWireframe', 'defaultOpacity',
    'synapseOpacity', 'nonHighlightableOpacity', 'lowOpacity', 'pinOpacity', 'pinLowOpacity',
    'highlightedObjectOpacity', 'backgroundOpacity', 'backgroundWireframeOpacity',
    'defaultRadius', 'defaultSomaRadius', 'defaultSynapseRadius', 'minRadius', 'maxRadius',
    'minSomaRadius', 'maxSomaRadius', 'minSynapseRadius', 'maxSynapseRadius', 'backgroundColor'
  ]);
  // this.settings.toneMappingPass.on('change', ((e)=>{controlPanel.updateDisplay();}), ['brightness']);
  this.settings.bloomPass.on('change', (()=>{controlPanel.updateDisplay();}), ['radius', 'strength', 'threshold']);
  this.settings.effectFXAA.on('change', (()=>{controlPanel.updateDisplay();}), ['enabled']);
  this.settings.backrenderSSAO.on('change', (()=>{controlPanel.updateDisplay();}), ['enabled']);
  this.uiVars.on('change', (()=>{controlPanel.updateDisplay();}), ['frontNum']);

  controlPanel.open();
  return controlPanel;
}

/**
* Correctly destroy dat GUI
*/
Neu3D.prototype.disposeControlPanel = function() {
  let folder = this.controlPanel.__folders['Settings'].__folders['Display Mode'];
  this.controlPanel.__folders['Settings'].removeFolder(folder);
  folder = this.controlPanel.__folders['Settings'].__folders['Visualization'].__folders['Opacity']
  this.controlPanel.__folders['Settings'].__folders['Visualization'].removeFolder(folder);
  folder = this.controlPanel.__folders['Settings'].__folders['Visualization'].__folders['Advanced']
  this.controlPanel.__folders['Settings'].__folders['Visualization'].removeFolder(folder);
  folder = this.controlPanel.__folders['Settings'].__folders['Visualization'];
  this.controlPanel.__folders['Settings'].removeFolder(folder);
  folder = this.controlPanel.__folders['Settings'].__folders['Size'];
  this.controlPanel.__folders['Settings'].removeFolder(folder);
  folder = this.controlPanel.__folders['Settings'];
  this.controlPanel.removeFolder(folder);
  for (let b of this._controlPanelBtnIds) {
    this.controlPanel.remove(b);
  }
  for (let c of this.controlPanel.__controllers){
    this.controlPanel.remove(c)
  }
  this.controlPanel.updateDisplay();
  this.controlPanel.destroy();
}

export { Neu3D };