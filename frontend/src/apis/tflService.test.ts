import { transformResponse, } from './tflService';

describe('tflService', () => {
    it('transformResponse filters and maps disruptions correctly', () => {
        const disruptions = [
            {
                category    : 'Line',
                type        : 'plannedWork',
                description : 'desc',
                closureText : 'closed',
            }, {
                category    : 'Line',
                type        : 'specialService',
                description : '',
                closureText : '',
            }, {
                category    : 'Line',
                type        : 'plannedWork',
                description : '',
                closureText : 'closed',
            }, {
                category    : 'Line',
                type        : 'plannedWork',
                description : 'desc',
                closureText : '',
            }, {
                category    : 'Line',
                type        : 'plannedWork',
                description : '',
                closureText : '',
            },
        ];

        expect(transformResponse(disruptions)).toEqual([
            {
                category    : 'Line',
                type        : 'plannedWork',
                description : 'desc',
                closureText : 'closed',
            }, {
                category    : 'Line',
                type        : 'plannedWork',
                description : '',
                closureText : 'closed',
            }, {
                category    : 'Line',
                type        : 'plannedWork',
                description : 'desc',
                closureText : '',
            },
        ]);
    });
});
