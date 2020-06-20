import axios from 'axios';

export default class DataProvider {
    static getCellRelations() {

        return axios.get('/static/cell_relations.json');
    }
    static getCellInfo() {

        return axios.get('/static/cell_info.json');
    }
    static getTemporalFeatures() {

        return axios.get('/static/cell_temporal.json');
    }
    static getMapJson() {

        return axios.get('/static/510700.json');
    }
    static getUserSemantics() {

        return axios.get('/static/user_semantics.json');
    }

    static getPersonODs() {

        return axios.get('/static/persons_cells.json');
    }
   
}