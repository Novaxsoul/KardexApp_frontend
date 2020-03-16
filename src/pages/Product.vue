<template>
  <q-page padding>
    <div class="doc-container">
      <div class="padding">
        <div class="row">
          <div class="col-md-8 text-left q-mb-sm">
            <div>
              <h2>Listado de productos</h2>
              <q-btn :label="create == false ? 'Nuevo producto' : 'Cancelar'" @click="create = !create; clean()" class="text text-center"  color="blue-10" />
              <div class="animate-search Shadow" style="padding: 20px; margin-top: 10px; border-bottom: 0px solid rgba(0, 0, 0, 0.125);" v-show="create">
                <br>
                <div class="row">
                <div class="col-8">
                  <div v-if="data.id === 0" class="q-display-1 q-mb-md">
                    <h4>Registrar Producto</h4>
                  </div>
                  <div v-else class="q-display-1 q-mb-md">
                    <h4>Modificar Producto</h4>
                  </div>
                    <div class="row q-mb-md">
                      <div class="col-sm-8 q-mr-md">
                          <q-input ref="name" label="Nombre" v-model.trim="data.name" lazy-rules :rules="[ val => val && val.length > 0 || 'Debe rellenar el campo']" />
                      </div>
                      <div class="col-sm-3">
                          <q-input ref="cant" type="number" label="Cantidad inicial" v-model.trim="data.cant" lazy-rules :rules="[ val => val && val > 0 || 'Debe rellenar el campo']" />
                      </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-8">
                          <q-select
                            ref="categ"
                            v-model="categ_id"
                            label="Categoría"
                            :options="list_cats"
                            emit-value
                            map-options
                            lazy-rules :rules="[ categ_id => categ_id && categ_id != null || 'Debe rellenar el campo']">
                            <template v-slot:prepend>
                              <q-icon name="content_paste" />
                            </template>
                          </q-select>
                      </div>
                    </div>
                  <br>
                  <div>
                    <q-btn v-if="data.id === 0" label="Guardar" color="blue-10" @click="createProduct()" />
                    <q-btn v-else label="Modificar" color="blue-10" @click="editProduct();" />
                  </div>
                  <br>
                </div>
              </div>
              <hr>
            </div>
            </div>
          </div>
          <div class="col-md-12">
            <q-table title="Productos" :data="prods" :columns="fields" :visible-columns="visibleColumns" row-key="id" :pagination.sync="pagination" :loading="loading" @request="getProducts">
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn label="Editar" color="blue-10" @click="getProductEdit(props.row.id, props.row.name, props.row.cant, props.row.categ.id)" />
                  <q-btn class="q-ml-sm" label="Eliminar" color="red-10" @click="deleteProduct(props.row.id)" />
                </q-td>
              </template>
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
        name: '',
        cant: 0,
        status: false
      },

      // Urls para controlar la paginación
      next: '/product/?limit=5&offset=0',
      previous: null,
      actual: '/product/?limit=5&offset=0',

      // Objeto que contiene el nombre de las columnas a mostrar
      visibleColumns: [ 'name', 'cant', 'categ', 'action'],

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
        { name: 'name', align: 'center', field: 'name', label: 'Nombre', sortable: true},
        { name: 'cant', align: 'center', field: row => row.cant == 0 ? 'Sin stock' : row.cant, label: 'Cantidad en existencia', sortable: true},
        { name: 'categ_id', align: 'center', field: row => row.categ.id, label: 'Id Categoría', sortable: true},
        { name: 'categ', align: 'center', field: row => row.categ.name, label: 'Categoría', sortable: true},
        { name: 'action', field: 'action', label: '' }
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

      // Objeto donde se almacenarán los productos
      prods: [],

      // Variable para mostrar el formulario de crear y actualizar
      create: false,

      // Variable que lleva el id de la categoría seleccionada en el formulario
      categ_id: null,

      // Lista que contiene las categorías
      list_cats: []
    }
  },
  methods: {

    // Método para obtener las categorías y rellenar la lista del formulario
    getCategories() {
      this.$axios
      .get('/category/?limit=999&offset=0')
      .then(response => {
         this.list_cats = response.data.results.map(record => {
          return { label: record.name, value: record.id }
        })
      })
      .catch(error => {
        Swal.fire('No se pudieron obtener las categorías', error.response.data.error, 'error')
      })
    },
    // Método para crear un producto
    createProduct() {
      if(this.validate()) {
        this.data.cant = parseInt(this.data.cant)
        this.$axios
          .post(`/product/?categ=${this.categ_id}`, this.data)
          .then(response => {
            Swal.fire('Producto creado', '', 'success')
            this.clean()
            this.getProducts({pagination: this.pagination})
          })
          .catch(error => {
            Swal.fire('El producto no ha sido creado', error.response.data.error, 'error')
          })
      }
    },
    // Método para obtener los datos del producto a actualizar
    getProductEdit(id, name, cant, id_cat) {
      this.data.id = id
      this.data.name = name
      this.data.cant = cant
      this.categ_id = id_cat
      this.create = true
    },
    // Método para editar un producto
    editProduct() {
      if (this.validate()) {
        this.data.cant = parseInt(this.data.cant)
        this.$axios
          .put(`/product/?categ=${this.categ_id}`, this.data)
          .then(response => {
            Swal.fire('Producto actualizado', '', 'success')
            this.getProducts({pagination: this.pagination})
          })
          .catch(error => {
            Swal.fire('El producto no ha sido actualizado', error.response.data.error, 'error')
          })
      }
    },
    // Método para obtener los productos
    // Recibe como parámetro un objeto que contiene los datos de la paginación solicitada
    getProducts(props) {

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
          this.prods = response.data.results
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
          Swal.fire('No se pudieron obtener los productos', error.response.data.error, 'error')
        })
    },
    // Método para eliminar un producto
    deleteProduct(id) {
      this.data.id = id
      Swal.fire({
        title: '¿Estás seguro de eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Eliminar'
        }).then((result) => {
            if (result.value) {
                this.$axios
                .delete('/product', { data : this.data})
                .then(response => {
                  Swal.fire('Producto eliminado', '', 'success')
                  this.getProducts({pagination: this.pagination})
                })
                .catch(error => {
                  Swal.fire('El producto no ha sido eliminado', error.response.data.error, 'error')
                }) 
              }
          })
      },
    // Método para limpiar los datos del fomulario
    clean() {
      this.data.id = 0
      this.data.name = ''
      this.data.cant = 0
      this.categ_id = null
      this.$refs.name.resetValidation()
      this.$refs.cant.resetValidation()
      this.$refs.categ.resetValidation()
    },
    // Método para validar los datos del formulario
    validate() {
      this.$refs.name.validate()
      this.$refs.cant.validate()
      this.$refs.categ.validate()
      if(this.$refs.name.hasError || this.$refs.cant.hasError || this.$refs.categ.hasError){
        return false
      } else {
        return true
      }
    }
  },
  created() {
    // Se obtiene la primera página
    this.getProducts({pagination: this.pagination})
    // Se obtienen las categorías
    this.getCategories()
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
