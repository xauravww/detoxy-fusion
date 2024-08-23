import  { useContext, useEffect } from 'react';
import * as lil from 'lil-gui'; 
import { settingsPanelContext } from '../context/SettingsPanel';

const SettingsPanel = () => {
  const { settings, setSettings } = useContext(settingsPanelContext);

  useEffect(() => {
    // Create the lil.GUI instance
    const gui = new lil.GUI();

    // Add model selection
    const models = [
      'sauravtechno/alvdansen-flux-koda',
      'sauravtechno/black-forest-labs-FLUX.1-dev'
    ];

    gui.add(settings, 'model', models).name('Model').onChange(value => {
      setSettings(prevSettings => ({ ...prevSettings, model: value }));
    });

/* will edit later if i want these params


    // gui.add(settings, 'cfg_scale', 0, 10, 0.1).name('CFG Scale').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, cfg_scale: value }));
    // });

    // gui.add(settings, 'steps', 1, 100, 1).name('Steps').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, steps: value }));
    // });

    // // Randomize Seed control
    // const randomizeSeedController = gui.add(settings, 'randomize_seed').name('Randomize Seed').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, randomize_seed: value }));
    //   if (value) {
    //     seedController.domElement.style.pointerEvents = 'none';
    //   } else {
    //     seedController.domElement.style.pointerEvents = '';
    //   }
    // });

    // // Seed control with slower adjustment
    // const seedController = gui.add(settings, 'seed', 0, 1000000000, 10000).name('Seed').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, seed: value }));
    // });

    // gui.add(settings, 'width', 100, 3000, 10).name('Width').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, width: value }));
    // });

    // gui.add(settings, 'height', 100, 3000, 10).name('Height').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, height: value }));
    // });

    // gui.add(settings, 'lora_scale', 0, 2, 0.01).name('LoRA Scale').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, lora_scale: value }));
    // });

    // gui.add(settings, 'use_cache').name('Use Cache').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, use_cache: value }));
    // });

    // gui.add(settings, 'wait_for_model').name('Wait for Model').onChange(value => {
    //   setSettings(prevSettings => ({ ...prevSettings, wait_for_model: value }));
    // });
*/



    // Apply basic styling for text color
    const style = document.createElement('style');
    style.textContent = `
      .lil-gui .lil-gui-folder .lil-gui-folder-title {
        color: black !important; /* Set folder title text color to black */
      }
      .lil-gui .lil-gui-folder .lil-gui-folder-content input {
        color: black !important; /* Set input text color to black */
      }
    `;
    document.head.appendChild(style);

    // Cleanup on component unmount
    return () => {
      gui.destroy();  // Clean up GUI
      document.head.removeChild(style); // Clean up custom styles
    };
  }, [settings, setSettings]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* lil.GUI will be attached to the body element by default */}
    </div>
  );
};

export default SettingsPanel;
