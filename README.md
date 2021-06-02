# npm Dependency Crawler

Sometimes when writing a commercial/proprietary application you'll want to ensure that you don't have a dependency that isn't open-source or that is copy-left.

If your application uses only [NPM](https://www.npmjs.com/) then all of your dependencies are in `package.json` and the transitive dependencies are in `package-lock.json`.
This utility looks for the license of your dependencies and outputs it neatly in a CSV file.

## How to use

1. Create a `in` directory in the project root
2. Put inside the `package.json` and `package-lock.json` files
3. Run this utility (`npm start`)
4. The output is written to `out.csv`
