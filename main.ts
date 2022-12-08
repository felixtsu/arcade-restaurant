
restaurant.init()

let orderCustomers:Sprite[] = []

restaurant.onCustomerOrder((customer:Sprite, dish:string) => {
    orderCustomers.push(customer)
})

restaurant.onDishReady((dish:string) => {

    for (let customer of orderCustomers) {
        if (sprites.readDataString(customer, "ORDER") == dish) {
            return customer
        }
    }
    return null
})