
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import SidebarContextFunction from './context/Sidebar.jsx'
import SettingsPanelContextFunction from './context/SettingsPanel.jsx'

import { BrowserRouter as Router } from 'react-router-dom'
import {WebSocketProvider} from './context/Websocket.jsx'

createRoot(document.getElementById('root')).render(
<Router>
<WebSocketProvider>

<SidebarContextFunction>
 <SettingsPanelContextFunction>

    <App /> 
 </SettingsPanelContextFunction>
 </SidebarContextFunction>
</WebSocketProvider>
</Router>
  ,
)
