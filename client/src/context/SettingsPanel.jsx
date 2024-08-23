import { createContext, useState } from "react";

export const settingsPanelContext = createContext();

// eslint-disable-next-line react/prop-types
export default function SettingsPanelContextFunction({ children }) {
    const [settings, setSettings] = useState({
        model: 'sauravtechno/black-forest-labs-FLUX.1-dev',
    });

    const data = {
        settings,
        setSettings
    };

    return (
        <settingsPanelContext.Provider value={data}>
            {children}
        </settingsPanelContext.Provider>
    );
}
