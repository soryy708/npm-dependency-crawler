const fs = require('fs');
const path = require('path');
const NpmApi = require('npm-api');

(async()=>{
    const [
        packageStr,
        packageLockStr,
    ] = await Promise.all([
        fs.promises.readFile(path.join('in', 'package.json'), {encoding: 'utf8'}),
        fs.promises.readFile(path.join('in', 'package-lock.json'), {encoding: 'utf8'}),
    ]);
    const packageJson = JSON.parse(packageStr);
    const packageLockJson = JSON.parse(packageLockStr);

    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    const packageLockDependencies = Object.keys(packageLockJson.dependencies || {});
    const transitiveDependencies = packageLockDependencies.filter(dep => !dependencies.includes(dep) && !devDependencies.includes(dep));

    const npm = new NpmApi();
    const getData = async (dep) => {
        const repo = npm.repo(dep);
        const license = await repo.prop('license');
        return {
            name: dep,
            license: license || '',
        };
    };
    const [
        dependenciesData,
        devDependenciesData,
        transitiveDependenciesData,
    ] = await Promise.all([
        await Promise.all(dependencies.map(getData)),
        await Promise.all(devDependencies.map(getData)),
        await Promise.all(transitiveDependencies.map(getData)),
    ]);
    
    const depDataToCsv = (data, depType) =>
        data.map(datum =>
            `${depType},${datum.name},${datum.license}`
        ).join('\n');

    const bom = '\ufeff'; // https://en.wikipedia.org/wiki/Byte_order_mark
    let out = bom;
    out += 'Dependency type,Name,License\n';
    out += depDataToCsv(dependenciesData, 'Direct') + '\n';
    out += depDataToCsv(devDependenciesData, 'Development') + '\n';
    out += depDataToCsv(transitiveDependenciesData, 'Transitive') + '\n';
    await fs.promises.writeFile(path.join('out.csv'), out);
})();
