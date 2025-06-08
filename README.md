# Volatility Surface Modeling

This is a frontend for modeling volatility curves/surfaces from Binance options data. You can select the underlying asset, choose expiration dates, and plot implied volatilities. 


## Features

- **Options Chain**: Displays the options chain for a given underlying asset and expiration date.
- **Volatility Plotting**: Visualizes implied volatilities for a selected option chain.
- **SVI Curve Parameterization**: Fits an implied volatility curve using the SVI (Stochastic Volatility Inspired) model.
- **Custom Options Pricing**: View the theoretical arbitrage-free implied volatility and premium for a custom option strike and expiration date.
- **Interactive UI**: Built with Shadcn UI for a modern and responsive user interface.
- **TypeScript Support**: Ensures type safety and better developer experience.


### Built With

* [![React][React.js]][React-url]
* [![Vite][Vite.js]][Vite-url]
* [![Tailwind CSS][TailwindCSS]][TailwindCSS-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Shadcn UI][ShadcnUI]][ShadcnUI-url]

## Getting Started

To get a local copy up and running follow these simple example steps.

### Pre-requisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Install and run the server from the [volatility-surface-server].
2. Clone this repository:
   ```bash
   git clone git@github.com:afan2g/vol-surface-frontend.git
    ```
3. Install NPM packages:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     VITE_API_URL=http://localhost:5000/
     ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```
6. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```
7. Open your browser and navigate to `http://localhost:5173` to view the application.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Aaron Fan - af3623@columbia.edu

Project Link: [https://github.com/afan2g/vol-surface-frontend](https://github.com/afan2g/vol-surface-frontend)

## Acknowledgements
- [This post for explaining implied volatility, options pricing, and SVI parameterization](https://quant.stackexchange.com/questions/76366/option-pricing-for-illiquid-case)

- [Arbitrage-free SVI volatility surfaces, J Gatheral, 2004](https://mfe.baruch.cuny.edu/wp-content/uploads/2013/01/OsakaSVI2012.pdf)

- [crpyto-volatility-surface](https://github.com/joshuapjacob/crypto-volatility-surface)



[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[ShadcnUI]: https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcn&logoColor=white
[ShadcnUI-url]: https://ui.shadcn.com/

