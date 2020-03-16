import Vue from 'vue'
import axios from 'axios'

//Create a baseURL for Axios
const axiosInstace = axios.create({
    baseURL: 'http://localhost:8080/AppKardex/'
  })

//Export Axios like an instance of Vue
export default ({ Vue }) => {
    Vue.prototype.$axios = axiosInstace
  }
