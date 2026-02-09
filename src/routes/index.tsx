import { RouterProvider, createBrowserRouter} from 'react-router-dom';
import { routes } from './routes.tsx';

export default function Router() {
    const router = createBrowserRouter(routes);
    return <RouterProvider router={router} />;
}
