//utils folder for manage other information like error

module.exports=(fn)=>{
    return (req, res , next) => {
        fn(req, res, next).catch(next);
    };
};