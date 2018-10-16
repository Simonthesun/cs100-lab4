<template>
  <div>
    <h1> View Object: <small class="text-muted">{{ objData.title }}</small></h1>
    
    <img v-bind:src="objData.primaryimageurl">
    
    <div>
      <p>
        Description: {{ objData.description }}
      </p>
      <p>
        Provenance: {{ objData.provenance }}
      </p>
      <p>
        Accession Year: {{ objData.accessionyear }}
      </p>
    </div>

    <form action="" method="POST">
      Comment: <input type="text" name="comment">
      <input type="submit" value="Submit">
    </form>

    <div v-for="comment in filteredComments">
      {{ comment.comment }}
    </div>
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
