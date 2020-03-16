<template>
  <q-layout view="hHh LpR lFr">
    <q-header>
      <q-toolbar color="blue-10">
        <q-toolbar-title>
          KardexApp
        </q-toolbar-title>
      </q-toolbar>
      <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>Menú</q-toolbar-title>
        </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer"
        show-if-above

        :mini="!drawer || miniState"
        @click.capture="drawerClick"
        :content-style="{ backgroundColor: '#000000' }"
        :width="300"
        :breakpoint="500"
        bordered
        dark>
      <q-list dark no-border link inset-delimiter>
        <!-- Kardex -->
        <q-expansion-item
        expand-separator
        :content-inset-level="0.5"
        icon="assignment"
        class="text-h6"
        label="Kardex">
          <q-item link to="/kardex"
          clickable
          v-ripple
          active-class="my-menu-link">
          <q-item-section avatar>
            <q-icon color="grey-2" name="format_list_bulleted"/>
          </q-item-section>
          <q-item-section class="text-subtitle1" style="color: #e0e0e0;">Consulta</q-item-section>
           </q-item>
        </q-expansion-item>
        <!-- Producto -->
        <q-expansion-item
        expand-separator
        :content-inset-level="0.5"
        icon="assignment"
        class="text-h6"
        label="Productos">
          <q-item link to="/product"
          clickable
          v-ripple
          active-class="my-menu-link">
          <q-item-section avatar>
            <q-icon color="grey-2" name="format_list_bulleted"/>
          </q-item-section>
          <q-item-section class="text-subtitle1" style="color: #e0e0e0;">Consulta</q-item-section>
           </q-item>
        </q-expansion-item>
        <!-- Categoria -->
        <q-expansion-item
        expand-separator
        :content-inset-level="0.5"
        icon="assignment"
        class="text-h6"
        label="Categorias">
          <q-item link to="/category"
          clickable
          v-ripple
          active-class="my-menu-link">
          <q-item-section avatar>
            <q-icon color="grey-2" name="format_list_bulleted"/>
          </q-item-section>
          <q-item-section class="text-subtitle1" style="color: #e0e0e0;">Consulta</q-item-section>
           </q-item>
        </q-expansion-item>
        <div v-if="this.validado === false ? false : true">
        </div>
      </q-list>
    </q-drawer>
    <q-page-container style="background-color: #DEE0E0;">
      <router-view />
    </q-page-container>
  </q-layout>

</template>

<script>

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: true,
      validado: null,
      drawer: false,
      miniState: false
    }
  },
  methods: {
    drawerClick (e) {
      // if in "mini" state and user
      // click on drawer, we switch it to "normal" mode
      if (this.miniState) {
        this.miniState = false

        // notice we have registered an event with capture flag;
        // we need to stop further propagation as this click is
        // intended for switching drawer to "normal" mode only
        e.stopPropagation()
      }
    }
  }
}
</script>

<style>
.my-menu-link{
  color: white;
  background: #027be3;
  width: 90%;
  }
</style>
