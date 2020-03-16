<template>
  <q-page padding>
    <div class="doc-container">
      <div class="padding">
        <div class="row">
          <div class="col-md-8 text-left q-mb-sm">
            <div>
              <h2>Listado de movimientos</h2>
              <q-btn label="Registrar compra" v-show="!create" @click="create = true; data.transType = 1" class="text text-center q-mr-md"  color="blue-10" />
              <q-btn label="Registrar venta" v-show="!create" @click="create = true; data.transType = 2" class="text text-center q-mr-md"  color="blue-10" />
              <q-btn label="Cancelar" v-show="create" @click="create = false; clean()" class="text text-center"  color="blue-10" />
              <div class="animate-search Shadow" style="padding: 20px; margin-top: 10px; border-bottom: 0px solid rgba(0, 0, 0, 0.125);" v-show="create">
                <br>
                <div class="row">
                <div class="col-12">
                  <div v-if="data.transType === 1" class="q-display-1 q-mb-md">
                    <h4>Registrar Compra</h4>
                  </div>
                  <div v-else class="q-display-1 q-mb-md">
                    <h4>Registrar Venta</h4>
                  </div>
                  <div class="row q-mb-md">
                    <div class="col-sm-8">
                      <q-select
                        ref="prod"
                        v-model="prod_id"
                        label="Producto"
                        :options="list_prods"
                        emit-value
                        map-options
                        lazy-rules :rules="[ prod_id => prod_id && prod_id != null || 'Debe rellenar el campo']">
                        <template v-slot:prepend>
                          <q-icon name="content_paste" />
                        </template>
                      </q-select>
                    </div>
                  </div>
                  <div class="row q-mb-md">
                    <div class="col-sm-8 q-mr-md">
                          <q-input ref="transDate" v-model="data.transDate" mask="####-##-##" label="Fecha de transacción" lazy-rules :rules="[ val => val && val.length > 0 || 'Debe rellenar el campo']">
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="qDateProxySD" transition-show="scale" transition-hide="scale">
                                  <q-date v-model="data.transDate" mask="YYYY-MM-DD" />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                      </div>
                  </div>
                    <div class="row">
                      <div class="col-sm-5 q-mr-md">
                          <q-input ref="units" type="number" label="Unidades" v-model.trim="data.units" lazy-rules :rules="[ val => val && val > 0 || 'Debe rellenar el campo']"/>
                      </div>
                      <div class="col-sm-5">
                          <q-input ref="unitCost" label="Costo por unidad" v-model.trim="data.unitCost" lazy-rules :rules="[ val => val && val > 0 || 'Debe rellenar el campo']"/>
                      </div>
                    </div>
                  <br>
                  <div>
                    <q-btn  label="Guardar" color="blue-10" @click="registerKardex()" />
                  </div>
                  <br>
                </div>
              </div>
              <hr>
            </div>
            </div>
          </div>
          <div class="col-md-12">
            <q-table title="Movimientos" :data="kardx" :columns="fields" row-key="id" :pagination.sync="pagination" :loading="loading" @request="getKardex">
            </q-table>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      data: {
        id: 0,
        transType: 0,
        units: 0,
        unitCost: 0,
        totalCost: 0,
        transDate: ''
      },
      // Urls para controlar la paginación
      next: '/kardex/?limit=5&offset=0',
      previous: null,
      actual: '/kardex/?limit=5&offset=0',

      // Campos de la tabla
      fields: [
        {
          name: 'id',
          required: true,
          label: 'Id',
          align: 'left',
          field: row => row.id,
          format: val => `${val}`
        },
        { name: 'prod', align: 'center', field: row => row.prod.name, label: 'Producto', sortable: true},
        { name: 'transType', align: 'center', field: row => row.transType == 1 ? 'Compra' : 'Venta', label: 'Acción', sortable: true},
        { name: 'units', align: 'center', field: 'units', label: 'Unidades', sortable: true},
        { name: 'unitCost', align: 'center', field: 'unitCost', label: 'Costo por unidad', sortable: true},
        { name: 'totalCost', align: 'center', field: 'totalCost', label: 'Costo total', sortable: true},
        { name: 'transDate', align: 'center', field: 'transDate', label: 'Fecha' }
      ],

      // Variables para controlar la paginación
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 10
      },

      // Variable para controlar el estado de carga de la tabla
      loading: false,

      // Objeto donde se almacenarán los movimientos
      kardx: [],

      // Variable para mostrar el formulario de crear y actualizar
      create: false,

      // Variable que lleva el id del producto seleccionado en el formulario
      prod_id: null,

       // Lista que contiene los productos
      list_prods: []
    }
  },
  methods: {
    // Método para obtener los productos y rellenar la lista del formulario
    getProducts() {
      this.$axios
      .get('/product/?limit=999&offset=0')
      .then(response => {
         this.list_prods = response.data.results.map(record => {
          return { label: record.name, value: record.id }
        })
      })
      .catch(error => {
        Swal.fire('No se pudieron obtener los productos', error.response.data.error, 'error')
      })
    },
    // Método para obtener los movimientos
    // Recibe como parámetro un objeto que contiene los datos de la paginación solicitada
    getKardex(props) {

      // Se obtienen los datos de la paginación solicitada
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      // Se le dice a la tabla que se están cargando los datos
      this.loading = true

      // Variable que llevará el endpoint
      let path = ''

       // Si hay un nuevo limit, se concaneta este limit nuevo a la url
      if(rowsPerPage != this.pagination.rowsPerPage) {
        path = `/category/?limit=${rowsPerPage}&offset=0`
      } else {
        // Si la página solicitada es una página anterior, se obtiene la url previa
        if(page < this.pagination.page) {
          path = this.previous
        } else if(page === this.pagination.page){
          // Si la página solicitada es la página actual, se obtiene la url actual
          path = this.actual
        } else {
          // Si la página solicitada es una página siguiente, se obtiene la siguiente url
          path = this.next
        }
      }

      // Se hace la petición a la API
      this.$axios
      .get(path)
      .then(response => {

        // Se obtienen los resultados y las url de la paginación
        this.kardx = response.data.results
        this.next = response.data.next
        this.previous = response.data.previous

        // Se actualiza la paginación de la tabla
        this.pagination.page = page
        this.pagination.rowsNumber = response.data.count
        this.pagination.rowsPerPage = rowsPerPage
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending

        // Se le dice a la tabla que se ha terminado de cargar
        this.loading = false
      })
      .catch(error => {
        Swal.fire('No se pudieron obtener los movimientos', error.response.data.error, 'error')
      })
    },
    // Método para registrar un movimiento
    registerKardex() {
      if(this.validate()) {
        this.data.units = parseInt(this.data.units)
        this.data.unitCost = parseFloat(this.data.unitCost)
        this.$axios
          .post(`/kardex/?prod=${this.prod_id}`, this.data)
          .then(response => {
            Swal.fire('Transacción creada', '', 'success')
            this.clean()
            this.create = false
            this.getKardex({pagination: this.pagination})
          })
          .catch(error => {
            Swal.fire('La transacción no ha sido creada', error.response.data.error, 'error')
          })
      }
    },
    // Método para validar los datos del formulario
    validate() {
      this.$refs.prod.validate()
      this.$refs.transDate.validate()
      this.$refs.units.validate()
      this.$refs.unitCost.validate()
      if(this.$refs.prod.hasError || this.$refs.transDate.hasError || this.$refs.units.hasError || this.$refs.unitCost.hasError){
        return false
      } else {
        return true
      }
    },
    // Método para limpiar los datos del formulario
    clean() {
      this.data.id = 0
      this.data.transType = 0
      this.data.units = 0
      this.data.unitCost = 0
      this.data.totalCost = 0
      this.data.transDate = ''
      this.data.prod_id = null
      this.$refs.prod.resetValidation()
      this.$refs.transDate.resetValidation()
      this.$refs.units.resetValidation()
      this.$refs.unitCost.resetValidation()
    }
  },
  created() {
    // Se obtiene la primera página
    this.getKardex({pagination: this.pagination})
    // Se obtienen los productos
    this.getProducts()
  }
}
</script>

<style>
.active {
  background-color: #d2f0d1;
}
.deactive {
  background-color: #fbd8d8;
}
.animate-search{
  animation-name: MyGestion;
    animation-duration: 2s;
}
.Shadow{
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.185) !important;
  background: white;
  margin-bottom: 30px;
}
@keyframes MyGestion {
    0%   {left: -100%; position: relative}
    100% {left: 100%}
}
@media (max-width: 600px) {
  .item-mobile{
    display: none
  }
}
</style>
