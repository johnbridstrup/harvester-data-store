# Getting Started with HDS Frontend

This project is the react web interface for all AFT Harvester data.<br/>
The project is boostrapped by `create-react-app` that automatically configures `webpack`, `babel` in the initial configuration. <br/>

## Project Architecture

The root project dir is the frontend directory.
All the react code is contained in `src` directory.
React dependencies listing are contained in `package.json`. <br/>
Inside the frontend folder we have the following directories

- .husky
- build --- automatically generate when you run `npm run build`
- make
  - dev
  - prod
- public
- src
- node_modules --- generated when you run `npm install`

## Code style & format

The code style used in the entire project follows [prettier](https://prettier.io/) recommended coding style.
When commiting your code, a pre-commit script to check && format the code is run automatically.

```
npm run format
```

## Available environment variables

create a `.env.local` file and set the following environment variables

```
REACT_APP_NODE_ENV=development
REACT_APP_HDS_API_URL=http://localhost:8085
REACT_APP_HOSTED_URL=http://localhost:3000
REACT_APP_HDS_PORT=8085
```

## Running development server

```
npm install && npm start
```

## Running production build

```
source build.start.sh
```

## Running automated test

Jest is the Test Runner. <br/>
Testing Library is React Testing Library. (still work in progress to add more test). <br/>
Likely to use Cypress for e2e testing.

```
npm test
```

## Adding a new view/page

- create the new page/view in pages folder, page name corresponds to django apps name not necessary but convenient e.g
  ```
  touch src/pages/newpage/index.js
  touch src/pages/newpage/styles.css
  ```
  or
  ```
  touch src/pages/newpage/customview/index.js
  touch src pages/newpage/customview/styles.css
  ```
- add the file to routes.js to include the page in react routes
  **NB if page is prone to make api requests use `lazy` (utilizes code-splitting) to import the file else if the page is just static page use normal `import`**
- create a component folder for the newpage to properly structure your page component as independent component files e.g
  ```
  touch src/components/newpage/Search.js
  touch src/components/newpage/CardList.js
  ```

## Build isolated frontend image

```
docker build -t hds_web_frontend:latest .
```

## Running isolated docker container

```
docker run hds_web_frontend:latest --port 3001
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode. \
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run check`

Checks the coding style if it matches the prettier coding style format.
In case the format doesn't match it displays the files not formatted correctly.
In case you only want to check for a single file

```
  npx prettier --check src/fileToCheck.js
```

### `npm run format`

Formats the code in the prettier code format for files that are not formatted.
In case you only want to format a single file run

```
  npx prettier --write src/fileToWrite.js
```
