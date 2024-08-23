import { Client } from '@gradio/client';

export const generateImage = (req,res)=> {
    if (!req.body.prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }
    const { prompt,settings } = req.body;
const {seed} = settings;
    Client.connect(`${settings.model}`)
        .then(instanceClient => {
            return instanceClient.predict("/predict",{ 		
                param_0: prompt, 
        }); // Using predict method
        })
        .then(result => {
            console.log('Generated image URL:', result.data[0]?.url);
            return res.json({ success: true, imageUrl: result.data[0]?.url });
        })
        .catch(error => {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: error.message });
        });
}