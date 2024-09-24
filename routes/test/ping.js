export default (pb) => {
    return async (req, res) => {
        return res.status(200).json('pong');
    };
};
