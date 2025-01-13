import logging
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials
from paypalserversdk.logging.configuration.api_logging_configuration import (
    LoggingConfiguration,
    RequestLoggingConfiguration,
    ResponseLoggingConfiguration,
)
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient
from paypalserversdk.controllers.orders_controller import OrdersController
from paypalserversdk.models.amount_with_breakdown import AmountWithBreakdown
from paypalserversdk.models.checkout_payment_intent import CheckoutPaymentIntent
from paypalserversdk.models.order_request import OrderRequest
from paypalserversdk.models.purchase_unit_request import PurchaseUnitRequest
from paypalserversdk.api_helper import ApiHelper
from django.conf import settings

# Initialize PayPal client
paypal_client = PaypalServersdkClient(
    client_credentials_auth_credentials=ClientCredentialsAuthCredentials(
        o_auth_client_id=settings.PAYPAL_CLIENT_ID,
        o_auth_client_secret=settings.PAYPAL_CLIENT_SECRET,
    ),
    logging_configuration=LoggingConfiguration(
        log_level=logging.INFO,
        mask_sensitive_headers=False,
        request_logging_config=RequestLoggingConfiguration(
            log_headers=True,
            log_body=True
        ),
        response_logging_config=ResponseLoggingConfiguration(
            log_headers=True,
            log_body=True
        )
    )
)

orders_controller = paypal_client.orders

def create_paypal_order(amount, product_name, quantity):
    order = orders_controller.orders_create({
        "body": OrderRequest(
            intent=CheckoutPaymentIntent.CAPTURE,
            purchase_units=[
                PurchaseUnitRequest(
                    AmountWithBreakdown(
                        currency_code='USD',
                        value=f'{amount:.2f}'
                    ),
                    description=f"{product_name} (x{quantity})"
                )
            ]
        ),
        "prefer": "return=representation",
    })
    return ApiHelper.json_serialize(order.body)


# Capture an order
def capture_paypal_order(order_id):
    order = orders_controller.orders_capture({
        "id": order_id,
        "prefer": "return=representation",
    })
    return ApiHelper.json_serialize(order.body)


