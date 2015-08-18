var ObjectGenerator = (function(){
    'use strict';

    /**
     * Generates random object based on the given config tweaks
     *
     * @param {Object} [config]
     * @param {Number} [config.maxBreadth=5] - each object in the tree will have at most 5 children, true for arrays if config.arrays=true
     * @param {number} [config.maxHeight=5] - the tree will only go down at max this level
     * @param {boolean} [config.arrays=false] - children can be arrays
     * @param {boolean} [config.functions=false]
     * @param {boolean} [config.complexTypes=false] - Include children that are Dates,Regex,Error
     * TODO: This next option is super buggy (it doesn't adhere to the maxBreadth and maxHeight options and it adds to global Object prototype O_O)
     * @param {boolean} [config.onPrototype=false] - place some of the children on the prototype (adheres to width, but maybe off by one for height)
     * @return {Object}        [description]
     */
    function getRandomObjectWrapper(config) {
        config = config || {};
        // kill references to config so that recursive calls don't interfere with each other
        var currConfig = {};
        currConfig.maxBreadth = config.hasOwnProperty('maxWidth') ? config.maxBreadth : 5;
        currConfig.maxHeight = config.hasOwnProperty('maxHeight') ? config.maxHeight : 5;
        currConfig.arrays = config.hasOwnProperty('arrays') ? config.arrays : false;
        currConfig.complexTypes = config.hasOwnProperty('complexTypes') ? config.complexTypes : false;
        currConfig.onPrototype = config.hasOwnProperty('onPrototype') ? config.onPrototype : false;
        currConfig.functions = config.hasOwnProperty('functions') ? config.functions : false;

        return _getRandomObject({}, currConfig);
    }

    function _getRandomObject(initialObj, config) {
        initialObj = initialObj || {};

        if (config.maxHeight <= 0) {
            return null;
        }

        var numChildren = Math.floor(Math.random() * (config.maxBreadth + 1)); // 0 to maxBreadth inclusive

        for (var i = 0; i < numChildren; i++) {
            var value = _getRandomValue(config);

            if (config.onPrototype && _getRandomBool()) {
                initialObj.__proto__ = initialObj.__proto__ || {};
                initialObj.__proto__[_getUniqueKey(Object.keys(initialObj.__proto__))] = value;
            } else {
                // exclude keys currently on this object
                initialObj[_getUniqueKey(Object.keys(initialObj))] = value;
            }
        }

        return initialObj;
    }

    function _getRandomValue(config) {
        var type = _getRandomType(config);
        var value;

        if (config.maxHeight <= 0) {
            return undefined;
        }

        switch (type) {
            case 'simple':
                value = _getSimpleValue();
                break;
            case 'array':
                value = _getRandomArray(config);
                break;
            case 'complex':
                value = _getComplexValue();
                break;
            case 'function':
                value = function() {};
                break;
            case 'object':
            default:
                value = _getRandomObject({}, _configReducedHeight(config));
        }

        return value;
    }

    function _getRandomArray(config) {
        var numChildren = Math.floor(Math.random() * (config.maxBreadth + 1));
        var arr = [];

        if ((config.maxHeight - 1) <= 0) {
            return arr;
        }

        for (var i = 0; i < numChildren; i++) {
            arr.push(_getRandomValue(_configReducedHeight(config)));
        }

        return arr;
    }

    // Reduces height of shallow copied config
    function _configReducedHeight(config) {
        var newConfig = {};

        Object.keys(config).forEach(function(c) {
            newConfig[c] = config[c];
        });

        if (typeof newConfig.maxHeight === 'number') {
            newConfig.maxHeight -= 1;
        } else {
            newConfig.maxHeight = 0;
        }

        return newConfig;
    }

    function _getRandomBool() {
        return !!(Math.floor(Math.random() * 2));
    }

    function _getUniqueKey(exclusions) {
        var key = _getRandomString();

        while (exclusions.indexOf(key) > -1) {
            key = _getRandomString();
        }

        return key;
    }

    function _getSimpleValue() {
        var randomSimple = Math.floor(Math.random() * 4);

        if (randomSimple === 0) { // string
            return _getRandomString();
        } else if (randomSimple === 1) { // number
            return Math.random() * 10;
        } else if (randomSimple === 2) { // undefined
            return undefined;
        } else if (randomSimple === 3) { // boolean
            return _getRandomBool();
        }
    }

    // total overkill
    function _getRandomString() {
        var randSeq = new Uint32Array(10);
        window.crypto.getRandomValues(randSeq);

        var outputStringBuffer = [];
        for (var i = 0; i < randSeq.length; i++) {
            outputStringBuffer.push(randSeq[i].toString(36));
        }

        return outputStringBuffer.join('').substr(0, 10);
    }

    function _getComplexValue() {
        var valueType = Math.floor(Math.random() * 3);

        switch (valueType) {
            case 0:
                return new Date(crypto.getRandomValues(new Uint32Array(1))[0]);
            case 1:
                return new RegExp(/12\s*\w+abc\d{1,4}/igm);
            case 2:
            default:
                return new Error('this is a test error');
        }
    }

    /**
     * [getValueType description]
     * @param {config.arrays}
     * @param {config.complexTypes}
     */
    function _getRandomType(config) {
        var types = ['simple', 'object'];

        if (config.functions) {
            types.push('function');
        }
        if (config.arrays) {
            types.push('array');
        }
        if (config.complexTypes) {
            types.push('complex');
        }

        return types[Math.floor(Math.random() * types.length)];
    }

    return {
        getRandom: getRandomObjectWrapper
    };
})();
