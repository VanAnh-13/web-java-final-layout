import unittest
import csv
import time
from selenium_test import HomePageTest, CSVTestResult, FullSiteFlowTest

if __name__ == '__main__':
    # Setup CSV writer for test results
    results_file = 'tests/test_results.csv'
    with open(results_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['test_id', 'status'])

        # Custom result class to inject CSV writer
        class MyCSVTestResult(CSVTestResult):
            def __init__(self, stream, descriptions, verbosity):
                super().__init__(stream, descriptions, verbosity)
                self.csv_writer = writer

        # Load all tests from HomePageTest
        loader = unittest.defaultTestLoader
        suite = unittest.TestSuite()
        # suite.addTests(loader.loadTestsFromTestCase(HomePageTest)) # Comment out to run only FullSiteFlowTest
        # Add combined site flow tests
        suite.addTests(loader.loadTestsFromTestCase(FullSiteFlowTest))

        # Run tests with custom CSV result class
        runner = unittest.TextTestRunner(resultclass=MyCSVTestResult, verbosity=2)
        runner.run(suite)
