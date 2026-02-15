const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const randomDelay = (min, max) => {
    return delay(Math.floor(Math.random() * (max - min + 1) + min));
}

module.exports = {
    delay,
    randomDelay
};
