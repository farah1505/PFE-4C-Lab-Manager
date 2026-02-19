// Corrected routes that remove redirectTo when canActivate is used
import { Routes } from '@angular/router';

const routes: Routes = [
    // Your other routes here
    {
        path: 'example-path',
        component: ExampleComponent,
        canActivate: [YourAuthGuard] // No redirectTo here
    },
    // Additional routes
];

export default routes;