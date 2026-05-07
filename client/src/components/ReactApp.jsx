import { StrictMode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IKContext } from 'imagekitio-react'
import App from '../App.jsx'

const queryClient = new QueryClient()

export default function ReactApp() {
  return (
    <StrictMode>
      <IKContext urlEndpoint="https://ik.imagekit.io/kayivtq3l">
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </HelmetProvider>
      </IKContext>
    </StrictMode>
  )
}
