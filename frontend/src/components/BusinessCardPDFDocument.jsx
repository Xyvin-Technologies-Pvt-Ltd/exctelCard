import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// Business card dimensions: 55mm x 85mm (portrait orientation - taller than wide)
// Convert to points: 1mm = 2.83465 points (72 points per inch, 25.4mm per inch)
// Note: Using portrait orientation (taller than wide)
const CARD_WIDTH = 55*1.2 * 2.83465; // ~156 points (width)
const CARD_HEIGHT = 85 *1.2 * 2.83465; // ~241 points (height)

// Round to avoid floating point issues
const PAGE_WIDTH = Math.round(CARD_WIDTH);
const PAGE_HEIGHT = Math.round(CARD_HEIGHT);

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    padding: 0,
    margin: 0,
  },
  cardContainer: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  contentOverlay: {
    position: "relative",
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 16,
    paddingBottom: 15,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  nameTitleContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    fontFamily: "Helvetica-Bold",
  },
  contactContainer: {
    marginTop: 3,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  iconImage: {
    width: 10,
    height: 10,
    marginRight: 6,
  },
  contactText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  addressIconImage: {
    width: 10,
    height: 10,
    marginRight: 6,
    marginTop: 2,
  },
  addressText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.3,
    flex: 1,
  },
  qrContainer: {
    position: "absolute",
    bottom: 10,
    left: PAGE_WIDTH / 2 - 27, // Center the QR code (container is ~54 points wide with padding)
    backgroundColor: "#FFFFFF",
    padding: 6,
    border: "2 solid white",
  },
  qrImage: {
    width: 42,
    height: 42,
  },
});

const BusinessCardPDFDocument = ({ user, qrCodeData, cardBackImage, cardFrontImage, qrCodeImage, iconImages }) => {
  return (
    <Document>
      {/* Front Side - User Information */}
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <View style={styles.cardContainer}>
          {/* Background Image */}
          {cardBackImage && (
            <Image src={cardBackImage} style={styles.backgroundImage} />
          )}
          
          {/* Content Overlay */}
          <View style={styles.contentOverlay}>
            {/* Name and Title */}
            <View style={styles.nameTitleContainer}>
              <Text style={styles.name}>{user?.name || "NOWSHAD HAMEED"}</Text>
              <Text style={styles.title}>{user?.title || "Chief Executive Officer"}</Text>
            </View>

            {/* Contact Information */}
            <View style={styles.contactContainer}>
              {/* Email */}
              {user?.email && (
                <View style={styles.contactRow}>
                  {iconImages?.email && (
                    <Image src={iconImages.email} style={styles.iconImage} />
                  )}
                  <Text style={styles.contactText}>{user.email}</Text>
                </View>
              )}

              {/* Phone */}
              {user?.phone && (
                <View style={styles.contactRow}>
                  {iconImages?.phone && (
                    <Image src={iconImages.phone} style={styles.iconImage} />
                  )}
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}

              {/* Phone 2 */}
              {user?.phone2 && (
                <View style={styles.contactRow}>
                  {iconImages?.mobile && (
                    <Image src={iconImages.mobile} style={styles.iconImage} />
                  )}
                  <Text style={styles.contactText}>{user.phone2}</Text>
                </View>
              )}

              {/* Address */}
              {user?.address && (
                <View style={styles.addressRow}>
                  {iconImages?.mapPin && (
                    <Image src={iconImages.mapPin} style={styles.addressIconImage} />
                  )}
                  <Text style={styles.addressText}>{user.address.replace(/\n/g, " ")}</Text>
                </View>
              )}

              {/* Website */}
              <View style={styles.contactRow}>
                {iconImages?.globe && (
                  <Image src={iconImages.globe} style={styles.iconImage} />
                )}
                <Text style={styles.contactText}>www.exctel.com</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Back Side - QR Code */}
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <View style={styles.cardContainer}>
          {/* Background Image */}
          {cardFrontImage && (
            <Image src={cardFrontImage} style={styles.backgroundImage} />
          )}
          
          {/* QR Code */}
          {qrCodeImage && (
            <View style={styles.qrContainer}>
              <Image src={qrCodeImage} style={styles.qrImage} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default BusinessCardPDFDocument;

