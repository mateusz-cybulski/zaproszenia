from app.schemas.common import AddressRead, AddressWrite, Text300


class MeWrite(AddressWrite):
    sender_name: Text300 = None


class MeRead(AddressRead):
    email: str | None
    sender_name: str | None
    # The sender's name and address are printed on every envelope.
    sender_complete: bool
