// 在此处添加您的代码
namespace restaurant {


    const ORDER = "ORDER"
    const ORDER_NO = "ORDER_NO"


    let customerOrderHandler: (customer: Sprite, dish:string)=>void = null
    let dishReadyHandler: (dish: string) => void = null
    
    let waitStaff:Sprite = null
    let cookStaff:Sprite = null
    let MENU = ["西红柿炒蛋", "蛋炒饭", "土豆牛肉"]
    const CUSTOMER_IMAGES :Image[]= []
    
    let orderNo = 1

    const waitingForOrderCustomers:Sprite[] = []
    const waitingForDishesCustomers:Sprite[] = []
    const customerOrders :string[]= []

    function randomPick<T>(collection : T[]):T {
        return collection[randint(0, collection.length - 1)]
    }

    function randomPop<T>(collection: T[]): T {
        return collection.removeAt(randint(0, collection.length - 1))
    }

    function findPlaceInQueueFor(newCustomer : Sprite) {

        if (waitingForOrderCustomers.length == 0) {
            story.spriteMoveToLocation(newCustomer, 40,  72, 50)
        } else {
            let tail = waitingForOrderCustomers[waitingForOrderCustomers.length - 1]
            story.spriteMoveToLocation(newCustomer, 40, tail.y + 16, 50)
        }

    }

    let orderingLock = false

    function customerOrder() {
        if (orderingLock) {
            return;
        }

        if (waitingForOrderCustomers.length == 0) {
            return;
        }

        orderingLock = true
        let orderingCustomer = waitingForOrderCustomers[0]

        story.startCutsceneOf(1001, () => {
            let dish = randomPick(MENU)
            
            sprites.setDataString(orderingCustomer, ORDER, dish)
            sprites.setDataNumber(orderingCustomer, ORDER_NO, orderNo)
            story.spriteSayText(waitStaff, "要吃点什么?", 15, 1, story.TextSpeed.VeryFast)
            story.spriteSayText(orderingCustomer, dish, 15, 1, story.TextSpeed.VeryFast)
            // story.spriteSayText(waitStaff, "好的,一共是5元", 15, 1, story.TextSpeed.VeryFast)
            // story.spriteSayText(orderingCustomer, "这是5元", 15, 1, story.TextSpeed.VeryFast)
            story.spriteSayText(waitStaff, "好的，你的号码是" + orderNo, 15, 1, story.TextSpeed.VeryFast)
            orderNo++;
            story.spriteSayText(waitStaff, "请等叫号取餐", 15, 1, story.TextSpeed.VeryFast)

            story.spriteMoveToLocation(orderingCustomer, 120 + randint(-32, 32), 88 + randint(-16, 16), 80)

            customerOrders.push(dish)
            
            if (customerOrderHandler != null) {
                customerOrderHandler(orderingCustomer, dish)
            }

            waitingForOrderCustomers.shift()
            waitingForDishesCustomers.push(orderingCustomer)
            for (let c of waitingForOrderCustomers) {
                story.spriteMoveToLocation(c, c.x, c.y - 16, 100)
            }

            orderingLock = false
        })


    }


    function customerEnter() {
        let newCustomer = sprites.create(randomPick(CUSTOMER_IMAGES));
        tiles.placeOnTile(newCustomer, tiles.getTileLocation(2, 7))

        let dish = MENU[randint(0, MENU.length)]
        
        findPlaceInQueueFor(newCustomer)
        waitingForOrderCustomers.push(newCustomer)
        
        
    }

    function nextCustomerFor(dish:string) :Sprite{
        for (let c of waitingForDishesCustomers) {
            if (sprites.readDataString(c, ORDER) == dish) {
                waitingForDishesCustomers.removeElement(c)
                return c
            }
        }
        return null;
    }

    let dishReadyLock = false
    function dishReady() {

        if (dishReadyLock || customerOrders.length == 0) {
            return
        }

        dishReadyLock = true
        
        story.startCutsceneOf(1000, ()=>{
            let dish = randomPop(customerOrders);
            story.startCutscene(()=>{
                story.spriteSayText(cookStaff, "开始做" + dish)
                
                let randtime = randint(5, 8)
                let s = ""
                for (let i = 0; i < randtime; i++) {
                    if (i % 3 == 0) {
                        s = ""
                    }
                    s += "."
                    story.spriteSayText(cookStaff, s)
                    pause(1000)
                }
                story.spriteSayText(cookStaff, dish + "做好了")
                if (dishReadyHandler == null) {
                    story.spriteSayText(cookStaff, "没人来取")
                    story.spriteSayText(cookStaff, "扔了")
                     
                }  else {
                    dishReadyHandler(dish)
                    story.spriteSayText(cookStaff, "请" + sprites.readDataNumber(userJudgeCustomer, ORDER_NO) + "号客人取餐")
                    story.spriteMoveToLocation(userJudgeCustomer, 120, 72, 80)

                    let nextCustomer =  nextCustomerFor(dish)
                    if (nextCustomer != userJudgeCustomer) {
                        story.spriteSayText(nextCustomer, "!!")
                        story.spriteMoveToLocation(nextCustomer, 108, 72, 96)
                        story.spriteSayText(nextCustomer, "我先来的啊")
                        story.spriteSayText(nextCustomer, "怎么搞的")
                        game.over(false)
                    }


                    let orderedDish = sprites.readDataString(userJudgeCustomer, ORDER)
                    if (orderedDish != dish) {
                        story.spriteSayText(userJudgeCustomer, "我点的不是这个啊")
                        story.spriteSayText(userJudgeCustomer, "什么鬼")
                        game.over(false)
                    }


                    story.spriteSayText(userJudgeCustomer, "谢谢")
                    story.spriteMoveToLocation(userJudgeCustomer, 176, userJudgeCustomer.y, 100)
                    userJudgeCustomer.destroy()
                    info.changeScoreBy(1)
            }

                dishReadyLock = false

            })
            
        })


    }


    //% blockId=on_init
    //% block="开门营业"
    export function init() {
        
        CUSTOMER_IMAGES.push(assets.image`customer1`)
        CUSTOMER_IMAGES.push(assets.image`customer2`)
        CUSTOMER_IMAGES.push(assets.image`customer3`)
        CUSTOMER_IMAGES.push(assets.image`customer4`)
        CUSTOMER_IMAGES.push(assets.image`customer5`)
       

        tiles.setTilemap(assets.tilemap`default`)

        waitStaff = sprites.create(img`
            . . . . . . . c c c . . . . . .
            . . . . . . c b 5 c . . . . . .
            . . . . c c c 5 5 c c c . . . .
            . . c c b c 5 5 5 5 c c c c . .
            . c b b 5 b 5 5 5 5 b 5 b b c .
            . c b 5 5 b b 5 5 b b 5 5 b c .
            . . f 5 5 5 b b b b 5 5 5 c . .
            . . f f 5 5 5 5 5 5 5 5 f f . .
            . . f f f b f e e f b f f f . .
            . . f f f 1 f b b f 1 f f f . .
            . . . f f b b b b b b f f . . .
            . . . e e f e e e e f e e . . .
            . . e b c b 5 b b 5 b f b e . .
            . . e e f 5 5 5 5 5 5 f e e . .
            . . . . c b 5 5 5 5 b c . . . .
            . . . . . f f f f f f . . . . .
        `)
        tiles.placeOnTile(waitStaff, tiles.getTileLocation(2,2))

        cookStaff = sprites.create(img`
            . . . . 9 9 9 9 9 9 9 9 9 . . .
            . . . 9 9 1 1 1 1 1 1 1 9 9 . .
            . . . 8 9 9 9 9 9 9 9 9 9 1 . .
            . . . 8 1 9 1 1 9 1 1 9 1 1 . .
            . . . 8 1 9 1 1 9 1 1 9 1 1 . .
            . . . 8 1 9 1 1 9 1 1 9 1 1 . .
            . . . 8 1 9 1 1 9 1 1 9 1 1 . .
            . . . f 8 1 1 1 1 1 1 1 f f . .
            . . . f f d f e e f d f f f . .
            . . . f f 1 f d d f 1 f f f . .
            . . . f f d d d d d d f f . . .
            . . . . e 8 1 f 1 1 8 e . . . .
            . . e d 1 1 1 1 1 2 1 f d e . .
            . . e e f b b b b b b f e e . .
            . . . . 1 1 1 1 1 1 1 1 . . . .
            . . . . . f f f f f f . . . . .
        `)
        tiles.placeOnTile(cookStaff, tiles.getTileLocation(7, 2))

        forever(()=>{
            if (waitingForOrderCustomers.length<4 && Math.percentChance(40)) {
                customerEnter()
            }
            pause(1000)
        })


        forever(() => {
            customerOrder()
            pause(10)
        })

        forever(()=> {
            dishReady()
            pause(10)
        })
    }




    //% blockId=on_cusomter_order
    //% block="客人下单"
    //% draggableParameters
    export function onCustomerOrder(cb: (customer:Sprite, dish : string) => void) {
        customerOrderHandler = cb
    }

    //% blockId=prepare_menu
    //% block="写好菜单 %menu"
    export function prepareMenu(menu : string[]) {
        if (menu.length < 3) {
            game.splash("就这么几道菜还学人开餐厅")
            game.splash("至少准备三道菜啊")
            game.over(false)
        }

        MENU = menu
    }


    //% blockId=on_dish_ready
    //% block="出餐"
    //% draggableParameters
    export function onDishReady(cb:(dish:string) => void) {
        dishReadyHandler = cb;
    }

    let userJudgeCustomer :Sprite = null

    //% blockId=call_customer_to_collect
    //% block="叫 $customer=variables_get(mySprite) 取餐"
    export function callCustomerToCollect(customer : Sprite) {
        userJudgeCustomer = customer
    }

    
}