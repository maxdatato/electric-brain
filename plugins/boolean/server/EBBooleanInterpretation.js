/*
 Electric Brain is an easy to use platform for machine learning.
 Copyright (C) 2016 Electric Brain Software Corporation

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const
    EBFieldAnalysisAccumulatorBase = require('./../../../server/components/datasource/EBFieldAnalysisAccumulatorBase'),
    EBFieldMetadata = require('../../../shared/models/EBFieldMetadata'),
    EBInterpretationBase = require('./../../../server/components/datasource/EBInterpretationBase'),
    underscore = require('underscore');

/**
 * The string interpretation is used for all strings.
 */
class EBBooleanInterpretation extends EBInterpretationBase
{
    /**
     * Constructor
     */
    constructor()
    {
        super('boolean');
    }


    /**
     * This method should return the list of interpretations that this interpretation is dependent
     * on. This interpretation won't be checked unless the dependent interpretation is the next
     * one up in the chain.
     *
     * If the list of dependencies is empty, then this interpretation is assumed to be able to
     * operate directly on raw-values from JSON.
     *
     * @return [String] An array of strings with the type-names for each of the higher interpretations
     */
    getUpstreamInterpretations()
    {
        return [];
    }



    /**
     * This method should look at the given value and decide whether it can be handled by this
     * interpretation.
     *
     * @param {*} value Can be practically anything.
     * @return {Promise} A promise that resolves to either true or false on whether that value
     *                   can be handled by that interpretation.
     */
    checkValue(value)
    {
        const acceptableStringValues = [
            'true',
            'false'
        ];

        // Is it a string and its contents look booleanish
        if (underscore.isString(value) && acceptableStringValues.indexOf(value.toLowerCase()) !== -1)
        {
            return Promise.resolve(true);
        }
        // Is it directly just a boolean value
        else if (underscore.isBoolean(value))
        {
            return Promise.resolve(true);
        }
        else
        {
            return Promise.resolve(false);
        }
    }



    /**
     * This method should transform a given schema for a value following this interpretation.
     * It should return a new schema for the interpreted version.
     *
     * @param {EBSchema} schema The schema for a field that wants to be interpreted by this interpretation.
     * @return {Promise} A promise that resolves to a new EBSchema object.
     */
    transformSchema(schema)
    {
        return Promise.resolve(schema);
    }




    /**
     * This method should transform a given value, assuming its following this interpretation.
     *
     * @param {*} value The value to be transformed
     * @return {Promise} A promise that resolves to a new value.
     */
    transformValue(value)
    {
        return Promise.resolve(value);
    }




    /**
     * This method should return information about fields that need to be graphed on
     * the frontend for this interpretation.
     *
     * @param {*} value The value to be transformed
     * @return {Promise} A promise that resolves to an array of statistics
     */
    listStatistics(value)
    {
        return Promise.resolve([]);
    }




    /**
     * This method should transform an example into a value that is small enough to be
     * stored with the schema and shown on the frontend. Information can be destroyed
     * in this transformation in order to allow the data to be stored easily.
     *
     * @param {*} value The value to be transformed
     * @return {Promise} A promise that resolves to a new object that is similar to the old one to a human, but with size truncated for easy storage.
     */
    transformExample(value)
    {
        return Promise.resolve(value);
    }


    /**
     * This method should create a new field accumulator, a subclass of EBFieldAnalysisAccumulatorBase.
     *
     * This accumulator can be used to analyze a bunch of values through the lens of this interpretation,
     * and calculate statistics that the user may use to analyze the situation.
     *
     * @return {EBFieldAnalysisAccumulatorBase} An instantiation of a field accumulator.
     */
    createFieldAccumulator()
    {
        // This needs to be moved to a configuration file of some sort
        const maxLengthForHistogram = 250;

        // Create a subclass and immediately instantiate it.
        return new (class extends EBFieldAnalysisAccumulatorBase
        {
            constructor()
            {
                super();
                this.truths = 0;
                this.falses = 0;
            }

            accumulateValue(value)
            {
                if (value)
                {
                    this.truths += 1;
                }
                else
                {
                    this.falses += 1;
                }
            }

            getFieldMetadata()
            {
                const metadata = new EBFieldMetadata();

                metadata.types.push('boolean');

                const values = [];
                for(let n = 0; n < this.truths; n += 1)
                {
                    values.push('true')
                }
                for(let n = 0; n < this.falses; n += 1)
                {
                    values.push('false')
                }

                metadata.valueHistogram = EBValueHistogram.computeHistogram(values);

                return metadata;
            }
        })();
    }


    /**
     * This method should return a schema for the metadata associated with this interpretation
     *
     * @return {jsonschema} A schema representing the metadata for this interpretation
     */
    static metadataSchema()
    {
        return {
            "id": "EBFieldMetadata",
            "type": "object",
            "properties": {
                valueHistogram: EBValueHistogram.schema()
            }
        };
    }
}

module.exports = EBBooleanInterpretation;