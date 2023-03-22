# Govee React
A React+Node app originally to let my partner control my wifi LED lights from across the globe. Now I also let interviewers play with it :P  
  
This should work with every Govee light that supports their external API, though I haven't tested it on bulbs beyond H6003. 
  
![govee](https://user-images.githubusercontent.com/50963144/211161697-0ef372f6-3f5e-4c16-be1f-d4e7e0525028.jpg)

  
Adjust the sliders and color pickers to change the brightness and color of the lightbulbs via REST API.  
  
You can save currently selected favorite colors as preset color swatches in the "Presets" accordion menu for each connected light. These presets are saved in localStorage.  
  
Requests are sent to the [node server](https://github.com/7MinutesDead-Git/govee-server), before forwarded onto [Govee's external API](https://govee-public.s3.amazonaws.com/developer-docs/GoveeDeveloperAPIReference.pdf) (since these particular bulbs do not have local API support).  
  
React-query is used to manage cache and refetch stale data automatically. However, Govee's official external API is aggressively rate-limited which severely limits how often we can automatically refetch data to keep the UI in sync (say, if we make changes via Govee's official app rather than this one).  
  
But wouldn't it be cool if not only we could get the current state more often, but even see external changes live? Of course it would! So, this app also makes use of websockets.  
Any interaction with the UI by you or others will update live for all clients. The server simply broadcasts all changes received to all clients. This is a separate route from the commands sent to the external Govee API for actually changing the lights, and is handled by the node server.  
  
The client also [interpolates](https://en.wikipedia.org/wiki/Linear_interpolation) between websocket messages received from the server, so things look smoother. Meaning, if your client receives color updates (someone else is moving the color picker around) every 100ms, the UI will still update every say 16.7ms (60 FPS) and choose a value at a point between the received update and the currently *lerped* (linearly interpolated) value, thus inching closer each render in a smooth fashion.  
This allows us to reasonably cutdown on the amount of network activity and server load while keeping the live aspect of the UI responsive and smooth.  
  
This is like how video games smooth out player movement with network or server latency. If you're into game development, you've likely seen `lerp` a lot, haha.
  
## SETUP  
1) Once you have cloned down or forked this repo, be sure to run `npm install` in the root directory to install the dependencies *(such as the very nice [react-hot-toast](https://react-hot-toast.com/) for fancy toast notifications when commands are being sent to the server).* 
2) On your local dev build, you'll need to place a `.env` file in the root directory, configured as such:  
```
VITE_PORT="8080"
VITE_SERVER_URL="http://localhost"
VITE_SERVER_SOCKET="ws://localhost"
```
3) You'll want to modify these environment variables on whatever service you decide to host the app on, to match where you end up hosting the backend server *(for example, replace `http://localhost` with `whatever-you-name-your-backend.fly.io` if your server was hosted on fly.io)*.  
    Most services have their own ways of setting environment variables, so check with their documentation (netlify for example has an "Environment" setting under "Build and Deploy" where you can declare these for production).  
  
4) Setup the [govee-server backend here](https://github.com/7MinutesDead-Git/govee-server), and choose a hosting service or method for deployment of a backend.  
  
5) Deploy and have fun!

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
