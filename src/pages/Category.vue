<template>
  <q-page padding>
    <div class="doc-container">
      <div class="padding">
        <div class="row">
          <div class="col-md-8 text-left q-mb-sm">
            <div>
              <h2>Listado de categorias</h2>
              <q-btn :label="create == false ? 'Nueva categoría' : 'Cancelar'" class="text text-center" @click="create = !create; clean()" color="blue-10" />
              <div class="animate-search Shadow" style="padding: 20px; margin-top: 10px; border-bottom: 0px solid rgba(0, 0, 0, 0.125);" v-show="create">
                <br>
                <div class="row">
                <div class="col-6">
                  <div v-if="data.id === 0" class="q-display-1 q-mb-md">
                    <h4>Crear Categoría</h4>
                  </div>
                  <div v-else class="q-display-1 q-mb-md">
                    <h4>Modificar Categoría</h4>
                  </div>
                    <q-input ref="name" v-model="data.name" label="Nombre" lazy-rules :rules="[ val => val && val.length > 0 || 'Debe rellenar el campo']" clearable @keyup.enter="data.id === 0 ? createCategory() : editCategory()">
                        <template v-slot:prepend>
                          <q-icon name="check" />
                        </template>
                    </q-input>
                  <br>
                  <div>
                    <q-btn v-if="data.id === 0" label="Guardar" color="blue-10" @click="createCategory()" />
                    <q-btn v-else label="Modificar" color="blue-10" @click="editCategory();" />
                  </div>
                  <br>
                </div>
              </div>
              <hr>
            </div>
          </div>
        </div>
          <div class="col-md-12">
            <q-table title="Categorías" :data="cats" :columns="fields" row-key="id" :pagination.sync="pagination" :loading="loading" @request="getCategories">
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn label="Editar" color="blue-10" @click="getCategoryEdit(props.row.id, props.row.name)" />
                  <q-btn class="q-ml-sm" label="Eliminar" color="red-10" @click="deleteCategory(props.row.id)" />
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
        name: ''
      },

      // Urls para controlar la paginación
      next: '/category/?limit=5&offset=0',
      previous: null,

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

      // Objeto donde se almacenarán las categorías
      cats: [],

      // Variable para mostrar el formulario de crear y actualizar
      create: false
    }
  },
  methods: {

    // Método para obtener las categorías.
    // Recibe como parámetro un objeto que contiene los datos de la paginación solicitada
    getCategories(props) {

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
          this.cats = response.data.results
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
          Swal.fire('No se pudieron obtener las categorías', error.response.data.error, 'error')
        })
    },
    // Método para crear una categoría
    createCategory() {
      if(this.validate()) {
        this.$axios
          .post('/category', this.data)
          .then(response => {
            Swal.fire('Categoría creada', '', 'success')
            this.clean()
            this.getCategories()
          })
          .catch(error => {
            Swal.fire('La categoría no ha sido creada', error.response.data.error, 'error')
          })
      }
    },
    // Método para obtener los datos de la categoría a actualizar
    getCategoryEdit(id, name){
      this.data.id = id
      this.data.name = name
      this.create = true
    },
    // Método para editar una categoría
    editCategory() {
      if(this.validate()) {
        this.$axios
          .put('/category', this.data)
          .then(response => {
            Swal.fire('Categoría actualizada', '', 'success')
            this.getCategories()
          })
          .catch(error => {
            Swal.fire('La categoría no ha sido actualizada', error.response.data.error, 'error')
          })
      }
    },
    // Método para eliminar una categoría
    deleteCategory(id) {
      this.data.id = id
      Swal.fire({
        title: '¿Estás seguro de eliminar esta categoría?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Eliminar'
        }).then((result) => {
            if (result.value) {
                this.$axios
                .delete('/category', { data : this.data})
                .then(response => {
                  Swal.fire('Categoría eliminada', '', 'success')
                  this.clean();
                  this.getCategories()
                })
                .catch(error => {
                  Swal.fire('La categoría no ha sido eliminada', error.response.data.error, 'error')
                }) 
              }
          })
      },
    // Método para validar el formulario
    validate(){
      this.$refs.name.validate()
      if(this.$refs.name.hasError){
        return false
      } else {
        return true
      }
    },
    // Método para limpiar el formulario
    clean() {
      this.data.id = 0
      this.data.name = ""
      this.$refs.name.resetValidation()
    }
  },
  created() {
    // Se obtiene la primera página
    this.getCategories({pagination: this.pagination})
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
