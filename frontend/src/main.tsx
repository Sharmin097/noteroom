import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import UserAuthProvider from './context/UserAuthContext.tsx'
import GlobalComponentControllerProvider from './context/GlobalComponentContext.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <GlobalComponentControllerProvider>
        <UserAuthProvider>
          <App />
        </UserAuthProvider>
      </GlobalComponentControllerProvider>
    </BrowserRouter>
)
