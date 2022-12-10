restaurant.onDishReady(function (dish) {
    restaurant.callCustomerToCollect(orderCustomer)
})
restaurant.onCustomerOrder(function (customer, dish) {
    orderCustomer = customer
})
let orderCustomer: Sprite = null
restaurant.prepareMenu([
"番茄蛋",
"牛肉饼",
"拉面",
"烧鸡"
])
restaurant.init()
