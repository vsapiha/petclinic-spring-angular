
from fake_useragent import UserAgent
from faker import Faker
import csv

ua = UserAgent()
fake = Faker()


with open('windows_users.csv', 'w') as csvfile:
    windows_writer = csv.writer(csvfile, delimiter=',',
                            quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for i in range(1,250):
        windows_writer.writerow([fake.user_name(),fake.ipv4(network=False),ua.ie])