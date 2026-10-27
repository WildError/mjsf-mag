<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="product-overview">
    <h2 class="product-overview__title">Огляд товару</h2>

    <p class="product-overview__description">
      {{ product.description }}
    </p>

    <dl class="product-overview__details">
      <div class="product-overview__row">
        <dt>Категорія</dt>
        <dd>{{ product.category }}</dd>
      </div>

      <div v-if="product.brand" class="product-overview__row">
        <dt>Бренд</dt>
        <dd>{{ product.brand }}</dd>
      </div>

      <div v-if="product.warrantyInformation" class="product-overview__row">
        <dt>Гарантія</dt>
        <dd>{{ product.warrantyInformation }}</dd>
      </div>

      <div v-if="product.shippingInformation" class="product-overview__row">
        <dt>Доставка</dt>
        <dd>{{ product.shippingInformation }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.product-overview {
  min-width: 0;
  padding: 24px 0;
  overflow-wrap: anywhere;
}

.product-overview__title {
  margin: 0 0 16px;
  font-size: 24px;
}

.product-overview__description {
  margin: 0 0 24px;
  line-height: 1.6;
}

.product-overview__details {
  margin: 0;
}

.product-overview__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #dce0e5;
}

.product-overview__row dt {
  font-weight: 700;
}

.product-overview__row dd {
  margin: 0;
}

@media (max-width: 480px) {
  .product-overview__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
}
</style>