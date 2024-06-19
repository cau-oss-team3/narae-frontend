# narae-frontend

Simple frontend for `Narae` project.
This project is built with svelte and sveltekit.

## Developing

1. install dependencies with `npm install`  

2. add a `.env` file with the following content:  
    
    you can copy the `.env.example` file and rename it to `.env`.
    modify the `PUBLIC_API_SERVER` and `PUBLIC_WS_SERVER` to match your backend server.

3. start a development server:  
    
    ```bash
    npm run dev
    
    # or start the server and open the app in a new browser tab
    npm run dev -- --open
    ```

## Building

To create a production build:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## License
`narae-frontend` is distributed under the MIT License. For more details, see the LICENSE file.

## Support
If you encounter any issues or have questions, please open an issue on this repository. We will do our best to address them.
