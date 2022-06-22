import 'regenerator-runtime/runtime'
import { initContract, signInWithNearWallet, signOutNearWallet, setGreetingOnContract, getGreetingFromContract } from './near-api'
import getConfig from './config'

// ====== Initialize the API for NEAR ======
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()){
      signedInFlow()
    }else{
      signedOutFlow()
    }
  })
  .catch(alert)

// On submit, take the new greeting and send it to the contract
document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault()
  const { greeting } = event.target.elements
  document
    .querySelector('#signed-in-flow main')
    .classList.add('please-wait')
  try {
    // ===== Call smart-contract to save the value on then blockchain =====
    await setGreetingOnContract(greeting.value)
  } catch (e) {
    alert(
      'Something went wrong! ' +
      'Maybe you need to sign out and back in? ' +
      'Check your browser console for more info.'
    )
    throw e
  }

  // ===== Fetch the data from the blockchain =====
  await fetchGreeting()
  document
    .querySelector('#signed-in-flow main')
    .classList.remove('please-wait')
}
document.querySelector('#sign-in-button').onclick = signInWithNearWallet
document.querySelector('#sign-out-button').onclick = signOutNearWallet

async function fetchGreeting() {
  // ====== Get greeting from the contract ======
  const currentGreeting = await getGreetingFromContract()

  // Set all elements marked as greeting with the current greeting
  document.querySelectorAll('[data-behavior=greeting]').forEach(el => {
    el.innerText = currentGreeting
    el.value = currentGreeting
  })
}

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block'
  fetchGreeting()
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-in-flow').style.display = 'block'
  const { networkId, contractName, explorerUrl } = getConfig(process.env.NODE_ENV || 'testnet')
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`

  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = window.accountId
  })
  document.querySelectorAll('a[data-behavior=account-id]').forEach(el => {
    el.setAttribute('href', `${urlPrefix}/${window.accountId}`)
  })

  document.querySelectorAll('[data-behavior=network-id]').forEach(el => {
    el.innerText = networkId
  })
  document.querySelectorAll('a[data-behavior=network-id]').forEach(el => {
    el.setAttribute('href', explorerUrl)
  })

  document.querySelectorAll('[data-behavior=contract-name]').forEach(el => {
    el.innerText = contractName
  })
  document.querySelectorAll('a[data-behavior=contract-name]').forEach(el => {
    el.setAttribute('href', `${urlPrefix}/${contractName}`)
  })

  fetchGreeting()
}
