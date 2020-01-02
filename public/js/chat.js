const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $locationButton= document.querySelector('#btn_location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})
const authScroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //console.log(newMessageMargin)
    //visible height
    const visibleHeigth = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight
    //how far have i scroll?
    const scrollOfSet= $messages.scrollTop + visibleHeigth
    if(containerHeight - newMessageHeight <= scrollOfSet){
        $messages.scrollTop =  $messages.scrollHeight
    }
}
socket.on('message',(mss)=>{

    console.log(mss)
    //render template from server to html template in script messages

    const html = Mustache.render(messageTemplate,{
        username: mss.username,
        message : mss.text,
        createdAt: moment(mss.createdAt).format('kk:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    authScroll()
})
socket.on('locationMessage',(url)=>{
    const html = Mustache.render(locationTemplate,{
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('kk:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    authScroll()
    //console.log(url)
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageButton.setAttribute('disabled','disabled')

    const mss = e.target.elements.msg.value
    socket.emit('sendMessage',mss,(err)=>{
        $messageButton.removeAttribute('disabled')
        if(err){
            return console.log(err)
        }
        console.log('Message delivered')
    })

    $messageInput.value=''
    $messageInput.focus()
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location is shared')
        })

    })
})
socket.emit('join',{username,room},(error)=>{
     if(error){
         alert(error)
         location.href='/'
     }
})
// document.querySelector("#increment").addEventListener('click',()=>{
//     console.log('Clicked')
//     //socket.emit('increment')
// })