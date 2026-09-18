from sqlalchemy import Column, Integer, String, Float, Date, BigInteger, Text, Numeric, func, cast
from sqlalchemy.ext.hybrid import hybrid_property
from app.core.db import Base


class Customer(Base):
    __tablename__ = "customers"

    customerkey = Column(BigInteger, primary_key=True)
    gender = Column(String)
    name = Column(String)
    city = Column(String)
    state_code = Column(String)
    state = Column(String)
    zip_code = Column(String)
    country = Column(String)
    continent = Column(String)
    birthday = Column(String)


class Product(Base):
    __tablename__ = "products"

    productkey = Column(Integer, primary_key=True)
    product_name = Column(String)
    brand = Column(String)
    color = Column(String)
    unit_cost_usd = Column(String)
    unit_price_usd = Column(String)
    subcategorykey = Column(String)
    subcategory = Column(String)
    categorykey = Column(String)
    category = Column(String)

    @classmethod
    def price_expr(cls):
        return cast(
            func.replace(func.replace(func.replace(cls.unit_price_usd, "$", ""), ",", ""), " ", ""),
            Numeric
        )

    @classmethod
    def cost_expr(cls):
        return cast(
            func.replace(func.replace(func.replace(cls.unit_cost_usd, "$", ""), ",", ""), " ", ""),
            Numeric
        )


class Sale(Base):
    __tablename__ = "sales"

    order_number = Column(BigInteger, primary_key=True)
    line_item = Column(Integer, primary_key=True)
    order_date = Column(String, index=True)
    delivery_date = Column(String)
    customerkey = Column(BigInteger, index=True)
    storekey = Column(Integer, index=True)
    productkey = Column(Integer, index=True)
    quantity = Column(Integer)
    currency_code = Column(String(10))

    @classmethod
    def parsed_date_expr(cls):
        return func.to_date(cls.order_date, 'MM/DD/YYYY')


class Store(Base):
    __tablename__ = "stores"

    storekey = Column(Integer, primary_key=True)
    country = Column(String)
    state = Column(String)
    square_meters = Column(Float)
    open_date = Column(String)


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    date = Column(String, primary_key=True)
    currency = Column(String(10), primary_key=True)
    exchange = Column(Float)


class DataDictionary(Base):
    __tablename__ = "data_dictionary"

    table_name = Column(String, primary_key=True)
    field = Column(String, primary_key=True)
    description = Column(Text)
