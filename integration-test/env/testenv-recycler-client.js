const MAX_WAIT_TIME_IN_MILLIS = 1000 * 60 * 60 // 1 hour

const sleep = async (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const request = async (hostname, token, method, path, payload) => {
  const headers = { "Content-Type": "application/json" }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`https://${hostname}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  })

  if (res.status !== 200) {
    console.log(`Request failed with http status: ${res.status}`)
    throw new Error(`Request failed with http status: ${res.status}`)
  }

  return res.json()
}

export class Recycler {
  constructor(props) {
    this.props = props
    this.token = null
  }

  log(msg) {
    console.log(`${this.props.name} - ${msg}`)
  }

  login = async () => {
    this.log("Login")
    const { token } = await request(
      this.props.hostname,
      null,
      "POST",
      "/login",
      { username: this.props.username, password: this.props.password },
    )
    this.token = token
  }

  createReservation = async ({ name, count }) => {
    const timestamp = Date.now()
    this.log(`Create reservation with count: ${count}`)

    let reservation = await request(
      this.props.hostname,
      this.token,
      "POST",
      "/reservations",
      { count, name },
    )
    this.log(`Reservation created successfully with id: ${reservation.id}`)

    while (!reservation.ready) {
      await sleep(2000)
      this.log("Reservation not yet ready")
      if (Date.now() - timestamp > MAX_WAIT_TIME_IN_MILLIS) {
        throw new Error(`Max wait time ${MAX_WAIT_TIME_IN_MILLIS}ms exceeded`)
      }

      try {
        reservation = await request(
          this.props.hostname,
          this.token,
          "GET",
          `/reservations/${reservation.id}`,
        )
      } catch (e) {
        this.log(`Reservation could not be fulfilled: ${e}`)
        throw e
      }
    }

    this.log(
      `Reservation ready with accounts: ${reservation.accounts
        .map((a) => a.id)
        .join(", ")}`,
    )

    const { credentials } = reservation
    return {
      ...reservation,
      credentials: {
        ...credentials,
        expiration: new Date(credentials.expiration),
      },
    }
  }

  releaseReservation = async (reservationId) => {
    this.log(`Release reservation ${reservationId}`)
    await request(
      this.props.hostname,
      this.token,
      "DELETE",
      `/reservations/${reservationId}`,
    )
  }
}
