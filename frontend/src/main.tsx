import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import UserAuthProvider from './context/UserAuthContext.tsx'
import GlobalComponentControllerProvider from './context/GlobalComponentContext.tsx'
import { ApolloProvider } from '@apollo/client'
import client from './utils/apollo-client.ts'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ApolloProvider client={client}>
        <GlobalComponentControllerProvider>
          <UserAuthProvider>
              <App />
          </UserAuthProvider>
        </GlobalComponentControllerProvider>
      </ApolloProvider>
    </BrowserRouter>
)
