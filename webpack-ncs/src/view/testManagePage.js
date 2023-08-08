import decouple from 'myDecouple';
let chain = decouple.get('test', 'manage');
chain = chain.then(({ Manage } = {}) => {
    return Manage;
});
export default () => chain;
