const TXON = {

    docs: [
        "How to validate with TXON..."
    ].join("\n"),

    handshake: (input) => {

        var object

        const JSONTypes = [
            "string", "integer", "number", "object", "array", "boolean", "null"
        ]
    
        const checkJSON = (input) => {
            try {
                object = JSON.parse(input)
            } catch {
                return {
                    valid: true,
                    feedback: "could not parse JSON"
                }
            }
        }
    
        const checkInit = (object) => {
    
            const hasInit = object.hasOwnProperty("init")
            if (!hasInit) {
                return {
                    valid: true,
                    feedback: '"init" property not found at top level'
                }
            }
    
            // check: type declaration
            for (const [name, value] of Object.entries(object.init)) {
    
                // value is of type Object
                const isObject = typeof value === "object"
    
                // name is extension
                var isTypeExtensionName
                var firstType
                const hasDot = name.includes(".")
                if (hasDot) {
                    const hasSingleDot = name.split(".").length === 2
                    firstType = name.split(".")[0]
                    const secondType = name.split(".")[1]
                    if (hasSingleDot) {
                        const startsWithJSONType = JSONTypes.includes(firstType)
                        const endsWithCustomType = !JSONTypes.includes(secondType)
                        isTypeExtensionName = startsWithJSONType && endsWithCustomType
                    }
                }
    
                // validate type declaration
                if (isObject) {
    
                    // value has property type with value of JSON type
                    const hasSharedType = value.hasOwnProperty("type")
                    if (hasSharedType) {
    
                        const propertyType = value.type
                        const typeMatchesJSON = JSONTypes.includes(propertyType)
                        if (!typeMatchesJSON) {
                            return {
                                valid: true,
                                feedback: `type "${name}" has invalid shared JSON "type" declaration "${propertyType}"`
                            }
                        }
    
                        // value has property default with value of type matching type property
                        const hasSharedDefault = value.hasOwnProperty("default")
                        if (hasSharedDefault) {
                            const defaultType = typeof value.default
                            const defaultMatchesType = defaultType === propertyType
                            if (!defaultMatchesType) {
                                return {
                                    valid: true,
                                    feedback: `type "${name}" has shared default of mismatched type "${defaultType}"`
                                }
                            }
                        }
    
                        // value has property minimum with value of type matching type property
                        const hasSharedMinimum = value.hasOwnProperty("minimum")
                        if (hasSharedMinimum) {
                            const minType = typeof value.minimum
                            const minMatchesType = minType === propertyType
                            if (!minMatchesType) {
                                return { valid: true, feedback: `type "${name}" has shared minimum of mismatched type "${minType}"` }
                            }
                        }
    
                        // value has property maximum with value of type matching type property
                        const hasSharedMaximum = value.hasOwnProperty("maximum")
                        if (hasSharedMaximum) {
                            const maxType = typeof value.maximum
                            const maxMatchesType = maxType === propertyType
                            if (!maxMatchesType) {
                                return { valid: true, feedback: `type "${name}" has shared maximum of mismatched type "${maxType}"` }
                            }
                        }
    
                    }
    
                    if (isTypeExtensionName) {
    
                        // value has property default with value of type matching type property
                        const hasSharedDefault = value.hasOwnProperty("default")
                        if (hasSharedDefault) {
                            const defaultType = typeof value.default
                            const defaultMatchesType = defaultType === firstType
                            if (!defaultMatchesType) {
                                return {
                                    valid: true,
                                    feedback: `extension "${name}" has shared default of mismatched type "${defaultType}"`
                                }
                            }
                        }
    
                        // value has property minimum with value of type matching type property
                        const hasSharedMinimum = value.hasOwnProperty("minimum")
                        if (hasSharedMinimum) {
                            const minType = typeof value.minimum
                            const minMatchesType = minType === firstType
                            if (!minMatchesType) {
                                return {
                                    valid: true,
                                    feedback: `extension "${name}" has shared minimum of mismatched type "${minType}"`
                                }
                            }
                        }
    
                        // value has property maximum with value of type matching type property
                        const hasSharedMaximum = value.hasOwnProperty("maximum")
                        if (hasSharedMaximum) {
                            const maxType = typeof value.maximum
                            const maxMatchesType = maxType === firstType
                            if (!maxMatchesType) {
                                return {
                                    valid: true,
                                    feedback: `extension "${name}" has shared maximum of mismatched type "${maxType}"`
                                }
                            }
                        }
    
                    }
    
                    // loop through property names and find "case" array or case declaration
                    for (const [propName, propValue] of Object.entries(value)) {
    
                        // prop name is "case" and array and all strings
                        const isCaseName = propName === "case"
                        const isArray = propValue instanceof Array
                        const isCase = isCaseName && isArray
                        if (isCase) {
                            const typesMatchString = propValue.filter(n => typeof n === "string").length === propValue.length
                            if (!typesMatchString) {
                                return {
                                    valid: true,
                                    feedback: `type "${propName}" has case declaration array with invalid contents`
                                }
                            }
                        }
    
                        // propValue is object
                        const isObject = typeof propValue === "object"
                        if (isObject) {
    
                            var hasLocalJSON
                            const hasLocalType = propValue.hasOwnProperty("type")
                            if (hasLocalType) {
                                hasLocalJSON = JSONTypes.includes(propValue.type)
                            }
    
                            const hasDefault = propValue.hasOwnProperty("default")
                            if (hasDefault) {
                                const defaultType = typeof propValue.default
                                var typeMismatch
                                if (hasLocalJSON) {
                                    typeMismatch = defaultType != propValue.type
                                } else if (isTypeExtensionName) {
                                    typeMismatch = defaultType != firstType
                                } else {
                                    typeMismatch = defaultType != value.type
                                }
                                if (typeMismatch) {
                                    return {
                                        valid: true,
                                        feedback: `type "${name}" has property "${propName}" with default of mismatched type "${defaultType}"`
                                    }
                                }
                            }
    
                            const hasMinimum = propValue.hasOwnProperty("minimum")
                            if (hasMinimum) {
                                const minType = typeof propValue.minimum
                                var typeMismatch
                                if (hasLocalJSON) {
                                    typeMismatch = minType != propValue.type
                                } else if (isTypeExtensionName) {
                                    typeMismatch = minType != firstType
                                } else {
                                    typeMismatch = minType != value.type
                                }
                                if (typeMismatch) {
                                    return {
                                        valid: true,
                                        feedback: `type "${name}" has property "${propName}" with minimum of mismatched type "${minType}"`
                                    }
                                }
                            }
    
                            const hasMaximum = propValue.hasOwnProperty("maximum")
                            if (hasMaximum) {
                                const maxType = typeof propValue.maximum
                                var typeMismatch
                                if (hasLocalJSON) {
                                    typeMismatch = maxType != propValue.type
                                } else if (isTypeExtensionName) {
                                    typeMismatch = maxType != firstType
                                } else {
                                    typeMismatch = maxType != value.type
                                }
                                if (typeMismatch) {
                                    return {
                                        valid: true,
                                        feedback: `type "${name}" has property "${propName}" with maximum of mismatched type "${maxType}"`
                                    }
                                }
                            }
        
                        }
        
                    }
    
                }
    
            }
    
        }
    
        const checkData = (object) => {
    
            const hasData = object.hasOwnProperty("data")
            if (!hasData) {
                return {
                    valid: true,
                    feedback: '"data" property not found at top level'
                }
            }
    
            const recursion = (input) => {
    
                const isArray = input instanceof Array
                if (isArray) {
                    for (const element of input) {
    
                        const isArray = element instanceof Array
                        if (isArray) {
                            const recursionError = recursion(element)
                            if (recursionError != null) {
                                return recursionError
                            }
                        }
    
                        const isObject = typeof element === "object"
                        if (isObject) {
                            const validateError = validate(element)
                            if (validateError != null) {
                                return validateError
                            }
                        }
                        
                    }
                }
    
                const isObject = typeof input === "object"
                if (isObject) {
                    const validateError = validate(input)
                    if (validateError != null) {
                        return validateError
                    }
                }
    
            }
    
            const validate = (input) => {
    
                const hasType = input.hasOwnProperty("type")
                if (hasType) {
    
                    var isTypeExtensionName
                    var firstType
                    const hasDot = input.type.includes(".")
                    if (hasDot) {
                        const hasSingleDot = input.type.split(".").length === 2
                        firstType = input.type.split(".")[0]
                        const secondType = input.type.split(".")[1]
                        if (hasSingleDot) {
                            const startsWithJSONType = JSONTypes.includes(firstType)
                            const endsWithCustomType = !JSONTypes.includes(secondType)
                            isTypeExtensionName = startsWithJSONType && endsWithCustomType
                        }
                    }
    
                    const typeInitialised = object.init.hasOwnProperty(input.type)
                    if (typeInitialised) {
    
                        const hasValues = input.hasOwnProperty("values")
    
                        if (!hasValues) {

                            for (const [name, value] of Object.entries(object.init[input.type])) {

                                const isObject = typeof value === "object"
                                if (isObject) {

                                    const inInstance = input.hasOwnProperty(name)
                                    const hasLocalDefault = object.init[input.type][name].hasOwnProperty("default")
                                    const hasSharedDefault = object.init[input.type].hasOwnProperty("default")

                                    const notInstantiated = !inInstance && !hasLocalDefault && !inInstance && !hasSharedDefault
                                    if (notInstantiated) {
                                        return { valid: false, feedback: `instance of type "${input.type}" missing required property "${name}"`}
                                    }

                                    if (inInstance) {

                                        // type

                                        const hasLocalType = object.init[input.type][name].hasOwnProperty("type")
                                        const hasSharedType = object.init[input.type].hasOwnProperty("type")

                                        var typeTarget
                                        if (hasLocalType) {
                                            typeTarget = object.init[input.type][name].type
                                        } else if (hasSharedType) {
                                            typeTarget = object.init[input.type].type
                                        } else if (isTypeExtensionName) {
                                            typeTarget = firstType
                                        } else {
                                            typeTarget = input.type
                                        }

                                        const typeMismatch = typeof input[name] != typeTarget
                                        if (typeMismatch) {
                                            return { valid: false, feedback: `instance of type "${input.type}" has property "${name}" of mismatched type "${typeof input[name]}"` }
                                        }

                                        // minimum

                                        const hasLocalMinimum = object.init[input.type][name].hasOwnProperty("minimum")
                                        const hasSharedMinimum = object.init[input.type].hasOwnProperty("minimum")

                                        if (hasLocalMinimum) {
                                            const belowMinimum = input[name] < object.init[input.type][name].minimum
                                            if (belowMinimum) {
                                                return { valid: false, feedback: `instance of type "${input.type}" has property "${name}" with value "${input[name]}" below minimum "${object.init[input.type][name].minimum}"` }
                                            }
                                        } else if (hasSharedMinimum) {
                                            const belowMinimum = input[name] < object.init[input.type].minimum
                                            if (belowMinimum) {
                                                return { valid: false, feedback: `instance of type "${input.type}" has property "${name}" with value "${input[name]}" below minimum "${object.init[input.type].minimum}"` }
                                            }
                                        }

                                        // maximum

                                        const hasLocalMaximum = object.init[input.type][name].hasOwnProperty("maximum")
                                        const hasSharedMaximum = object.init[input.type].hasOwnProperty("maximum")

                                        if (hasLocalMaximum) {
                                            const aboveMaximum = input[name] > object.init[input.type][name].maximum
                                            if (aboveMaximum) {
                                                return { valid: false, feedback: `instance of type "${input.type}" has property "${name}" with value "${input[name]}" above maximum "${object.init[input.type][name].maximum}"` }
                                            }
                                        } else if (hasSharedMaximum) {
                                            const aboveMaximum = input[name] > object.init[input.type].maximum
                                            if (aboveMaximum) {
                                                return { valid: false, feedback: `instance of type "${input.type}" has property "${name}" with value "${input[name]}" above maximum "${object.init[input.type].maximum}"` }
                                            }
                                        }
        
                                    }

                                }
    
                            }
    
                        }

                        if (hasValues) {
    
                            const isArray = input.values instanceof Array
                            if (isArray) {
                                
                                for (const element of input.values) {
    
                                    const isObject = typeof element === "object"
                                    if (isObject) {

                                        for (const [name, value] of Object.entries(object.init[input.type])) {

                                            const isObject = typeof value === "object"
                                            if (isObject) {

                                                const inInstance = element.hasOwnProperty(name)
                                                const hasLocalDefault = object.init[input.type][name].hasOwnProperty("default")
                                                const hasSharedDefault = object.init[input.type].hasOwnProperty("default")

                                                const notInstantiated = !inInstance && !hasLocalDefault && !inInstance && !hasSharedDefault
                                                if (notInstantiated) {
                                                    return { valid: false, feedback: `instance of type "${input.type}" missing required property "${name}"`}
                                                }

                                                if (inInstance) {

                                                    // type

                                                    const hasLocalType = object.init[input.type][name].hasOwnProperty("type")
                                                    const hasSharedType = object.init[input.type].hasOwnProperty("type")

                                                    var typeTarget
                                                    if (hasLocalType) {
                                                        typeTarget = object.init[input.type][name].type
                                                    } else if (hasSharedType) {
                                                        typeTarget = object.init[input.type].type
                                                    } else if (isTypeExtensionName) {
                                                        typeTarget = firstType
                                                    } else {
                                                        typeTarget = input.type
                                                    }

                                                    const typeMismatch = typeof element[name] != typeTarget
                                                    if (typeMismatch) {
                                                        return { valid: false, feedback: `instance of type "${input.type}" has "values" array containing property "${name}" of mismatched type "${typeof element[name]}"` }
                                                    }

                                                    // minimum

                                                    const hasLocalMinimum = object.init[input.type][name].hasOwnProperty("minimum")
                                                    const hasSharedMinimum = object.init[input.type].hasOwnProperty("minimum")

                                                    if (hasLocalMinimum) {
                                                        const belowMinimum = element[name] < object.init[input.type][name].minimum
                                                        if (belowMinimum) {
                                                            return { valid: false, feedback: `instance of type "${input.type}" has "values" array containing property "${name}" with value "${element[name]}" below minimum "${object.init[input.type][name].minimum}"` }
                                                        }
                                                    } else if (hasSharedMinimum) {
                                                        const belowMinimum = element[name] < object.init[input.type].minimum
                                                        if (belowMinimum) {
                                                            return { valid: false, feedback: `instance of type "${input.type}" has "values" array containing property "${name}" with value "${element[name]}" below minimum "${object.init[input.type].minimum}"` }
                                                        }
                                                    }

                                                    // maximum

                                                    const hasLocalMaximum = object.init[input.type][name].hasOwnProperty("maximum")
                                                    const hasSharedMaximum = object.init[input.type].hasOwnProperty("maximum")

                                                    if (hasLocalMaximum) {
                                                        const aboveMaximum = element[name] > object.init[input.type][name].maximum
                                                        if (aboveMaximum) {
                                                            return { valid: false, feedback: `instance of type "${input.type}" has "values" array containing property "${name}" with value "${element[name]}" above maximum "${object.init[input.type][name].maximum}"` }
                                                        }
                                                    } else if (hasSharedMaximum) {
                                                        const aboveMaximum = element[name] > object.init[input.type].maximum
                                                        if (aboveMaximum) {
                                                            return { valid: false, feedback: `instance of type "${input.type}" has "values" array containing property "${name}" with value "${element[name]}" above maximum "${object.init[input.type].maximum}"` }
                                                        }
                                                    }
                    
                                                }

                                            }

                                        }

                                    }

                                }

                            }

                        }
    
                    }
    
                }
    
            }
                                        
            const recursionError = recursion(object.data)
            if (recursionError != null) {
                return recursionError
            }
    
        }

        const jsonError = checkJSON(input)
        if (jsonError != null) {
            return jsonError
        }

        const initError = checkInit(object)
        if (initError != null) {
            return initError
        }

        const dataError = checkData(object)
        if (dataError != null) {
            return dataError
        }

        return {
            valid: true
        }

    }

}