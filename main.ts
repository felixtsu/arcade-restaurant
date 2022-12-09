restaurant.onDishReady(function (dish) {
    for (let customer of orderCustomers) {
        if (sprites.readDataString(customer, "ORDER") == dish) {
            restaurant.callCustomerToCollect(customer)
        }
    }
})
restaurant.onCustomerOrder(function (customer, dish) {
    orderCustomers.push(customer)
})
let orderCustomers: Sprite[] = []
restaurant.init()
