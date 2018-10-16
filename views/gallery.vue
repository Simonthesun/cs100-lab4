<template>
  <div>
    <h1>View Gallery</h1>
    <table class="table">
        <tr>
          <th>Title</th>
          <th>Image</th>
          <th>People</th>
          <th>URL</th>
        </tr>


        <tr v-for="(object, i) in objects">
          <td><a v-bind:href="'/object/' + object.objectnumber">{{ object.title }}</a></td>
          <td><img v-bind:src="object.primaryimageurl"></td>
          <td> {{ people[i] }} </td>
          <td><a v-bind:href="object.url">See More</a></td>
        </tr>

    </table>
      
  </div>
</template>

<script>
export default {
    data() {
      return {};
    }
}


</script>

<style>
@import 'static/css/styles.css';
</style>
